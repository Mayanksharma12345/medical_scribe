# Azure Infrastructure for Medical Scribe AI
# Terraform configuration for HIPAA-compliant deployment

terraform {
  required_version = ">= 1.5"
  
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.80"
    }
  }
  
  backend "azurerm" {
    # Configure remote state storage
    # resource_group_name  = "terraform-state-rg"
    # storage_account_name = "tfstate"
    # container_name       = "tfstate"
    # key                  = "medical-scribe.tfstate"
  }
}

provider "azurerm" {
  features {
    key_vault {
      purge_soft_delete_on_destroy = false
      recover_soft_deleted_key_vaults = true
    }
  }
}

# Variables
variable "environment" {
  description = "Environment (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "location" {
  description = "Azure region"
  type        = string
  default     = "eastus"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "medical-scribe-ai"
}

# Locals
locals {
  resource_prefix = "${var.project_name}-${var.environment}"
  common_tags = {
    Environment = var.environment
    Project     = var.project_name
    ManagedBy   = "Terraform"
    Compliance  = "HIPAA"
  }
}

# Resource Group
resource "azurerm_resource_group" "main" {
  name     = "${local.resource_prefix}-rg"
  location = var.location
  tags     = local.common_tags
}

# Virtual Network (for private endpoints)
resource "azurerm_virtual_network" "main" {
  name                = "${local.resource_prefix}-vnet"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  address_space       = ["10.0.0.0/16"]
  tags                = local.common_tags
}

resource "azurerm_subnet" "app" {
  name                 = "app-subnet"
  resource_group_name  = azurerm_resource_group.main.name
  virtual_network_name = azurerm_virtual_network.main.name
  address_prefixes     = ["10.0.1.0/24"]
  
  delegation {
    name = "app-service-delegation"
    service_delegation {
      name    = "Microsoft.Web/serverFarms"
      actions = ["Microsoft.Network/virtualNetworks/subnets/action"]
    }
  }
}

resource "azurerm_subnet" "data" {
  name                 = "data-subnet"
  resource_group_name  = azurerm_resource_group.main.name
  virtual_network_name = azurerm_virtual_network.main.name
  address_prefixes     = ["10.0.2.0/24"]
  
  service_endpoints = ["Microsoft.Storage", "Microsoft.Sql", "Microsoft.KeyVault"]
}

# Azure Key Vault (for secrets and encryption keys)
resource "azurerm_key_vault" "main" {
  name                = "${substr(local.resource_prefix, 0, 24)}-kv"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  tenant_id           = data.azurerm_client_config.current.tenant_id
  sku_name            = "premium"  # HSM-backed for HIPAA
  
  enabled_for_deployment          = false
  enabled_for_disk_encryption     = true
  enabled_for_template_deployment = false
  purge_protection_enabled        = true
  soft_delete_retention_days      = 90
  
  network_acls {
    bypass                     = "AzureServices"
    default_action             = "Deny"
    virtual_network_subnet_ids = [azurerm_subnet.data.id]
  }
  
  tags = local.common_tags
}

data "azurerm_client_config" "current" {}

# Storage Account (for audio files and audit logs)
resource "azurerm_storage_account" "main" {
  name                     = "${substr(replace(local.resource_prefix, "-", ""), 0, 24)}st"
  resource_group_name      = azurerm_resource_group.main.name
  location                 = azurerm_resource_group.main.location
  account_tier             = "Standard"
  account_replication_type = "GRS"  # Geo-redundant for HIPAA
  
  min_tls_version                 = "TLS1_2"
  enable_https_traffic_only       = true
  allow_nested_items_to_be_public = false
  
  blob_properties {
    versioning_enabled = true
    
    delete_retention_policy {
      days = 2555  # 7 years for HIPAA
    }
  }
  
  network_rules {
    default_action             = "Deny"
    bypass                     = ["AzureServices"]
    virtual_network_subnet_ids = [azurerm_subnet.data.id]
  }
  
  tags = local.common_tags
}

# Storage Containers
resource "azurerm_storage_container" "audio" {
  name                  = "audio-recordings"
  storage_account_name  = azurerm_storage_account.main.name
  container_access_type = "private"
}

resource "azurerm_storage_container" "audit_logs" {
  name                  = "audit-logs"
  storage_account_name  = azurerm_storage_account.main.name
  container_access_type = "private"
}

# PostgreSQL Flexible Server
resource "azurerm_postgresql_flexible_server" "main" {
  name                   = "${local.resource_prefix}-psql"
  resource_group_name    = azurerm_resource_group.main.name
  location               = azurerm_resource_group.main.location
  version                = "15"
  administrator_login    = "psqladmin"
  administrator_password = random_password.db_password.result
  
  storage_mb = 32768
  sku_name   = "GP_Standard_D2s_v3"
  
  backup_retention_days        = 35
  geo_redundant_backup_enabled = true
  
  tags = local.common_tags
}

resource "random_password" "db_password" {
  length  = 32
  special = true
}

resource "azurerm_key_vault_secret" "db_password" {
  name         = "database-password"
  value        = random_password.db_password.result
  key_vault_id = azurerm_key_vault.main.id
}

# App Service Plan
resource "azurerm_service_plan" "main" {
  name                = "${local.resource_prefix}-asp"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  os_type             = "Linux"
  sku_name            = "P1v3"
  
  tags = local.common_tags
}

# App Service (Web App)
resource "azurerm_linux_web_app" "main" {
  name                = "${local.resource_prefix}-app"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  service_plan_id     = azurerm_service_plan.main.id
  
  https_only = true
  
  site_config {
    always_on        = true
    http2_enabled    = true
    minimum_tls_version = "1.2"
    
    application_stack {
      python_version = "3.11"
    }
  }
  
  identity {
    type = "SystemAssigned"
  }
  
  app_settings = {
    "WEBSITES_PORT"                    = "8000"
    "AZURE_KEY_VAULT_URL"             = azurerm_key_vault.main.vault_uri
    "AZURE_STORAGE_ACCOUNT_NAME"      = azurerm_storage_account.main.name
    "DATABASE_URL"                    = "postgresql://${azurerm_postgresql_flexible_server.main.administrator_login}:@${azurerm_postgresql_flexible_server.main.fqdn}:5432/medicalscribe"
  }
  
  tags = local.common_tags
}

# Application Insights
resource "azurerm_application_insights" "main" {
  name                = "${local.resource_prefix}-ai"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  application_type    = "web"
  
  tags = local.common_tags
}

# Outputs
output "app_service_url" {
  value = "https://${azurerm_linux_web_app.main.default_hostname}"
}

output "key_vault_uri" {
  value = azurerm_key_vault.main.vault_uri
}

output "storage_account_name" {
  value = azurerm_storage_account.main.name
}
