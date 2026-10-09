import requests
from requests.auth import HTTPBasicAuth

JIRA_EMAIL = 'christoph.haene@gmail.com'
JIRA_API_TOKEN = 'ATATT3xFfGF0wA9U-xH9LYZVzUxoaUGEijUNbmeT22FyH4hWD0iHNyX3aszhRD26wK_rkal_3mJM9BFaojua7RpPFXIOA4CqnsW1MP3VmAI7Mu3cQCnxu2CSrJ54SALmEJFYRc90nuytMp3PY-3Pf1qJlu5bpFTHWkt-Qfb75dm_Ocvy6_Lp5Z4=8247A8E3'
JIRA_SERVER = 'https://aequitas-ch.atlassian.net'

auth = HTTPBasicAuth(JIRA_EMAIL, JIRA_API_TOKEN)
headers = {"Accept": "application/json"}

# Fetch the Epic itself again to be sure what we have
response = requests.get(f"{JIRA_SERVER}/rest/api/2/issue/MAYA-28", auth=auth, headers=headers)
epic = response.json()
print("=== EPIC MAYA-28 ===")
# See what kind of issue this is
print("Issue Type:", epic.get('fields', {}).get('issuetype', {}).get('name'))
