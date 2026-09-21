variable "aws_region" {
  description = "AWS region for deployment"
  type        = string
  default     = "us-east-1"
}

variable "instance_type" {
  description = "EC2 instance size (Free Tier eligible 2 vCPU instance)"
  type        = string
  default     = "t3.small"
}

variable "key_name" {
  description = "SSH key pair name to attach to EC2 instance"
  type        = string
  default     = "roadmap-ai-key"
}
