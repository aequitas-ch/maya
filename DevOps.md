# DevOps / Maintenance Tasks

Here are the commands and instructions for tasks that I (the agent) cannot execute directly in the remote repository, but which can be run manually by you or GitHub Copilot.

## Clean up stale branches

All branches that are merged to `test` (other than `main` and `test` themselves) should be deleted.

To delete these merged branches in the remote repository (origin), copy the following script and run it locally in your terminal. It fetches the remote branches, finds those merged into `test`, ignores `main` and `test`, and deletes the remaining ones.

```bash
# Fetch the latest remote info and prune deleted references
git fetch --prune

# List remote branches merged into 'origin/test', filter out exactly 'main' and 'test', strip whitespaces and the "origin/" prefix
git branch -r --merged origin/test | awk '{print $1}' | grep -vE 'origin/(main|test)$' | sed 's/origin\///' > branches_to_delete.txt

# Briefly review the list
cat branches_to_delete.txt

# Delete all branches in the list from the remote 'origin'
cat branches_to_delete.txt | xargs -I {} git push origin --delete {}

# Clean up
rm branches_to_delete.txt
```

*(Note: You can delete local branches using `git branch -D <branch>`.)*
