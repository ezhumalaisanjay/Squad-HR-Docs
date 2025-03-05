````

import json
import urllib.request
import boto3

# Initialize DynamoDB

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table("ApolloDomains")  # Change this to your table name

def lambda_handler(event, context):
    category = event.get("category", "")
    url = f"<https://app.apollo.io/api/domains?category={category}>"  # Example URL, update accordingly

    try:
        # Open the URL and read the content
        with urllib.request.urlopen(url) as response:
            html_content = response.read().decode("utf-8")
        
        # Extract domain names (Assuming domains are present in HTML content)
        domains = extract_domains(html_content)
        
        # Store in DynamoDB
        for domain in domains:
            table.put_item(Item={"category": category, "domain": domain})
        
        return {
            "statusCode": 200,
            "body": json.dumps({"message": "Domains stored successfully", "domains": domains})
        }
    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)})
        }

def extract_domains(html_content):
    """Extract domain names from HTML content."""
    domains = set()
    for line in html_content.split("\n"):
        if "http" in line:
            domain = line.split["/"](2)  # Extract domain from URL
            domains.add(domain)
    return list(domains)
`````