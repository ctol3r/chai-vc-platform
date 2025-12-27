from locust import HttpUser, task, between, events

class CredentialUser(HttpUser):
    wait_time = between(0.1, 0.5)

    def on_start(self):
        self.credential_id = None

    @task
    def issue_verify_present(self):
        issue_payload = {
            "query": "mutation($name:String!,$issuer:String!){createCredential(name:$name,issuer:$issuer){id}}",
            "variables": {"name": "PerfTest", "issuer": "PerfIssuer"}
        }
        with self.client.post("/graphql", json=issue_payload, name="issue", catch_response=True) as resp:
            if resp.status_code == 200:
                try:
                    self.credential_id = resp.json()["data"]["createCredential"]["id"]
                except Exception:
                    resp.failure("bad issue response")
            else:
                resp.failure(f"issue failed {resp.status_code}")

        if self.credential_id:
            verify_payload = {
                "query": "query($id:ID!){credential(id:$id){id}}",
                "variables": {"id": self.credential_id}
            }
            self.client.post("/graphql", json=verify_payload, name="verify")

            present_payload = {"query": "query{credentials{id}}"}
            self.client.post("/graphql", json=present_payload, name="present")


@events.quitting.add_listener
def _(environment, **_kwargs):
    stats = environment.stats.get("verify", "POST")
    if stats and stats.get_response_time_percentile(0.95) > 250:
        print("Verify p95 >250ms")
        environment.process_exit_code = 1
