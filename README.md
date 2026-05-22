# Aequitas

*Read this in [German](README.de.md).*

Aequitas is a planned social network and digital platform for parents of disabled children.

The main goal of Aequitas is to reduce the immense administrative burden on parents of children with disabilities. By digitizing and automating forms, applications (e.g., helplessness allowance, assistance contributions), and communication with authorities (such as the IV / Invalidity Insurance), Aequitas aims to give parents back valuable time.

Additionally, through intelligent case comparisons and a recommender system, the platform provides support in identifying entitled services and better contextualizing authority decisions.

For more detailed information on the problems, solutions, and administrative processes, please read the [Whitepaper](WHITEPAPER.md).

## Deployment

Aequitas uses GitHub Actions for continuous deployment to Google Cloud Run. The workflow configures two environments:

1. **Test Environment (`test`)**: Automatically deploys on every push (merge) to the `main` branch.
2. **Production Environment (`production`)**: Deploys on pushes to the `main` branch, after the test deployment succeeds.

### Setup GitHub Secrets & Environments

To make the deployment work, configure the following in your GitHub Repository settings:

1. **Secrets (`Settings` -> `Secrets and variables` -> `Actions`)**:
   - `GCP_PROJECT_ID`: Your Google Cloud Project ID.
   - `GCP_CREDENTIALS`: The JSON key of a Google Cloud Service Account with permissions to push images to Container Registry (GCR) or Artifact Registry and deploy to Cloud Run.
   - `DJANGO_SECRET_KEY` (recommended): A dedicated Django secret used for Cloud Run deployments. If omitted, the workflow falls back to deriving a stable key from `GCP_CREDENTIALS`.

2. **Environments (`Settings` -> `Environments`)**:
   - Create an environment named `production`.
   - Check "Required reviewers" and select the users/teams who must approve production deployments.

Aequitas is also designed to be easily deployable locally using Docker Compose. For detailed instructions on how to run this platform, specifically targeting QNAP Container Station and other Linux environments, please read the **[QNAP Deployment Guide](DEPLOYMENT_QNAP.md)**.
