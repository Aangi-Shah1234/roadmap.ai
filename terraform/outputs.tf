output"ec2_public_ip" {
  description = "Public IP address of the Roadmap AI EC2 instance"
  value       = aws_instance.roadmap_server.public_ip
}

output "ec2_public_dns" {
  description = "Public DNS of the EC2 instance"
  value       = aws_instance.roadmap_server.public_dns
}

output "app_url" {
  description = "Direct Web App URL on EC2"
  value       = "http://${aws_instance.roadmap_server.public_ip}:3000"
}
