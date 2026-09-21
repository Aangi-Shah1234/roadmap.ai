output "ec2_instance_id" {
  description = "ID of the Roadmap AI EC2 instance"
  value       = aws_instance.roadmap_server.id
}

output "ec2_public_ip" {
  description = "Dynamic Public IP address of the Roadmap AI EC2 instance (No Elastic IP)"
  value       = aws_instance.roadmap_server.public_ip
}

output "web_app_url_http" {
  description = "Direct Web App URL on Port 80 (via Nginx reverse proxy)"
  value       = "http://${aws_instance.roadmap_server.public_ip}"
}

output "web_app_url_port_3000" {
  description = "Direct Web App URL on Port 3000"
  value       = "http://${aws_instance.roadmap_server.public_ip}:3000"
}

output "ssh_command" {
  description = "SSH command to connect to the EC2 instance"
  value       = "ssh -i roadmap-ai-key.pem ubuntu@${aws_instance.roadmap_server.public_ip}"
}
