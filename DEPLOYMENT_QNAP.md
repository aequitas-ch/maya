# QNAP Deployment Guide

This guide explains how to deploy the Aequitas platform on a QNAP NAS using Container Station. The application is containerized using Docker, making it easy to spin up the database, backend, and frontend simultaneously.

You can deploy the application automatically using the provided SSH script or manually via the QNAP Web UI.

---

## Prerequisites

1.  **Container Station:** Ensure that the "Container Station" app is installed and running on your QNAP NAS.
2.  **SSH Access (Method A only):** Ensure you have enabled SSH on your QNAP (Control Panel -> Network & File Services -> Telnet / SSH).

---

## Method A: Automated Deployment via SSH (Recommended)

This method uses the included `deploy.sh` script to automatically build the images and launch the containers.

1.  **Connect to your QNAP via SSH:**
    Open your terminal and connect using your QNAP administrator credentials:
    ```bash
    ssh admin@<YOUR_QNAP_IP>
    ```

2.  **Navigate to the project directory:**
    Clone or copy this repository to a shared folder on your QNAP (e.g., `/share/Public/aequitas`).
    ```bash
    cd /share/Public/aequitas
    ```

3.  **Run the deployment script:**
    Execute the script to stop old containers, build fresh images, and start the platform in the background:
    ```bash
    ./deploy.sh
    ```

4.  **Verify:**
    Once the script finishes successfully, the platform is running.
    *   Access the **Frontend** at: `http://<YOUR_QNAP_IP>:80`
    *   Verify the **Backend** at: `http://<YOUR_QNAP_IP>:8000/api/health`

---

## Method B: Manual Deployment via Container Station Web UI

If you prefer not to use the command line, you can deploy the stack directly from your browser.

1.  **Open Container Station:** Log in to your QNAP Web UI and open the Container Station app.
2.  **Create an Application:**
    *   Navigate to **Applications** in the left sidebar.
    *   Click the **Create** button.
3.  **Configure the Application:**
    *   **Application Name:** Enter `aequitas`
    *   **YAML Code:** Copy the entire content of the `docker-compose.yml` file from this repository and paste it into the YAML editor box.
4.  **Deploy:**
    *   Click **Create** or **Validate**. Container Station will now pull the base images, build the custom backend/frontend containers, and start them.
5.  **Verify:**
    *   Once the application status shows as running, open your browser and navigate to the IP address of your QNAP on port 80.

---

## Troubleshooting

*   **Port Conflicts:** If ports `80` or `8000` or `5432` are already in use by other services on your QNAP, edit the `docker-compose.yml` file. Change the *left* side of the port mappings (e.g., change `"80:80"` to `"8080:80"` for the frontend). If using Method A, rerun `./deploy.sh`.
*   **Logs:** You can view the logs either via the Container Station Web UI by clicking on the respective containers, or via SSH using:
    ```bash
    docker compose logs -f
    ```
