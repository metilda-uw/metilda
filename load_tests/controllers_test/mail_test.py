from locust import HttpUser, task, between

# Dummy data for testing
USER_EMAILS = [
    ("sree1159@u.edu", "Test Message 1", "Test Subject 1"),
    ("sree1159@u.edu", "Test Message 2", "Test Subject 2"),
    ("sree1159@u.edu", "Test Message 3", "Test Subject 3"),
    ("sree1159@u.edu", "Test Message 4", "Test Subject 4"),
    ("sree1159@u.edu", "Test Message 5", "Test Subject 5"),
    ("sree1159@u.edu", "Test Message 6", "Test Subject 6"),
    ("sree1159@u.edu", "Test Message 7", "Test Subject 7"),
    ("sree1159@u.edu", "Test Message 8", "Test Subject 8"),
    ("sree1159@u.edu", "Test Message 9", "Test Subject 9"),
    ("sree1159@u.edu", "Test Message 10", "Test Subject 10"),
    ("sree1159@u.edu", "Test Message 1", "Test Subject 1"),
    ("sree1159@u.edu", "Test Message 2", "Test Subject 2"),
    ("sree1159@u.edu", "Test Message 3", "Test Subject 3"),
    ("sree1159@u.edu", "Test Message 4", "Test Subject 4"),
    ("sree1159@u.edu", "Test Message 5", "Test Subject 5"),
    ("sree1159@u.edu", "Test Message 6", "Test Subject 6"),
    ("sree1159@u.edu", "Test Message 7", "Test Subject 7"),
    ("sree1159@u.edu", "Test Message 8", "Test Subject 8"),
    ("sree1159@u.edu", "Test Message 9", "Test Subject 9"),
    ("sree1159@u.edu", "Test Message 10", "Test Subject 10"),
    ("sree1159@u.edu", "Test Message 1", "Test Subject 1"),
    ("sree1159@u.edu", "Test Message 2", "Test Subject 2"),
    ("sree1159@u.edu", "Test Message 3", "Test Subject 3"),
    ("sree1159@u.edu", "Test Message 4", "Test Subject 4"),
    ("sree1159@u.edu", "Test Message 5", "Test Subject 5"),
    ("sree1159@u.edu", "Test Message 6", "Test Subject 6"),
    ("sree1159@u.edu", "Test Message 7", "Test Subject 7"),
    ("sree1159@u.edu", "Test Message 8", "Test Subject 8"),
    ("sree1159@u.edu", "Test Message 9", "Test Subject 9"),
    ("sree1159@u.edu", "Test Message 10", "Test Subject 10"),
    ("sree1159@u.edu", "Test Message 1", "Test Subject 1"),
    ("sree1159@u.edu", "Test Message 2", "Test Subject 2"),
    ("sree1159@u.edu", "Test Message 3", "Test Subject 3"),
    ("sree1159@u.edu", "Test Message 4", "Test Subject 4"),
    ("sree1159@u.edu", "Test Message 5", "Test Subject 5"),
    ("sree1159@u.edu", "Test Message 6", "Test Subject 6"),
    ("sree1159@u.edu", "Test Message 7", "Test Subject 7"),
    ("sree1159@u.edu", "Test Message 8", "Test Subject 8"),
    ("sree1159@u.edu", "Test Message 9", "Test Subject 9"),
    ("sree1159@u.edu", "Test Message 10", "Test Subject 10"),
    ("sree1159@u.edu", "Test Message 1", "Test Subject 1"),
    ("sree1159@u.edu", "Test Message 2", "Test Subject 2"),
    ("sree1159@u.edu", "Test Message 3", "Test Subject 3"),
    ("sree1159@u.edu", "Test Message 4", "Test Subject 4"),
    ("sree1159@u.edu", "Test Message 5", "Test Subject 5"),
    ("sree1159@u.edu", "Test Message 6", "Test Subject 6"),
    ("sree1159@u.edu", "Test Message 7", "Test Subject 7"),
    ("sree1159@u.edu", "Test Message 8", "Test Subject 8"),
    ("sree1159@u.edu", "Test Message 9", "Test Subject 9"),
    ("sree1159@u.edu", "Test Message 10", "Test Subject 10"),
    ("sree1159@u.edu", "Test Message 1", "Test Subject 1"),
    ("sree1159@u.edu", "Test Message 2", "Test Subject 2"),
    ("sree1159@u.edu", "Test Message 3", "Test Subject 3"),
    ("sree1159@u.edu", "Test Message 4", "Test Subject 4"),
    ("sree1159@u.edu", "Test Message 5", "Test Subject 5"),
    ("sree1159@u.edu", "Test Message 6", "Test Subject 6"),
    ("sree1159@u.edu", "Test Message 7", "Test Subject 7"),
    ("sree1159@u.edu", "Test Message 8", "Test Subject 8"),
    ("sree1159@u.edu", "Test Message 9", "Test Subject 9"),
    ("sree1159@u.edu", "Test Message 10", "Test Subject 10"),
    ("sree1159@u.edu", "Test Message 1", "Test Subject 1"),
    ("sree1159@u.edu", "Test Message 2", "Test Subject 2"),
    ("sree1159@u.edu", "Test Message 3", "Test Subject 3"),
    ("sree1159@u.edu", "Test Message 4", "Test Subject 4"),
    ("sree1159@u.edu", "Test Message 5", "Test Subject 5"),
    ("sree1159@u.edu", "Test Message 6", "Test Subject 6"),
    ("sree1159@u.edu", "Test Message 7", "Test Subject 7"),
    ("sree1159@u.edu", "Test Message 8", "Test Subject 8"),
    ("sree1159@u.edu", "Test Message 9", "Test Subject 9"),
    ("sree1159@u.edu", "Test Message 10", "Test Subject 10"),
    ("sree1159@u.edu", "Test Message 1", "Test Subject 1"),
    ("sree1159@u.edu", "Test Message 2", "Test Subject 2"),
    ("sree1159@u.edu", "Test Message 3", "Test Subject 3"),
    ("sree1159@u.edu", "Test Message 4", "Test Subject 4"),
    ("sree1159@u.edu", "Test Message 5", "Test Subject 5"),
    ("sree1159@u.edu", "Test Message 6", "Test Subject 6"),
    ("sree1159@u.edu", "Test Message 7", "Test Subject 7"),
    ("sree1159@u.edu", "Test Message 8", "Test Subject 8"),
    ("sree1159@u.edu", "Test Message 9", "Test Subject 9"),
    ("sree1159@u.edu", "Test Message 10", "Test Subject 10"),
    ("sree1159@u.edu", "Test Message 1", "Test Subject 1"),
    ("sree1159@u.edu", "Test Message 2", "Test Subject 2"),
    ("sree1159@u.edu", "Test Message 3", "Test Subject 3"),
    ("sree1159@u.edu", "Test Message 4", "Test Subject 4"),
    ("sree1159@u.edu", "Test Message 5", "Test Subject 5"),
    ("sree1159@u.edu", "Test Message 6", "Test Subject 6"),
    ("sree1159@u.edu", "Test Message 7", "Test Subject 7"),
    ("sree1159@u.edu", "Test Message 8", "Test Subject 8"),
    ("sree1159@u.edu", "Test Message 9", "Test Subject 9"),
    ("sree1159@u.edu", "Test Message 10", "Test Subject 10"),
    ("sree1159@u.edu", "Test Message 1", "Test Subject 1"),
    ("sree1159@u.edu", "Test Message 2", "Test Subject 2"),
    ("sree1159@u.edu", "Test Message 3", "Test Subject 3"),
    ("sree1159@u.edu", "Test Message 4", "Test Subject 4"),
    ("sree1159@u.edu", "Test Message 5", "Test Subject 5"),
    ("sree1159@u.edu", "Test Message 6", "Test Subject 6"),
    ("sree1159@u.edu", "Test Message 7", "Test Subject 7"),
    ("sree1159@u.edu", "Test Message 8", "Test Subject 8"),
    ("sree1159@u.edu", "Test Message 9", "Test Subject 9"),
    ("sree1159@u.edu", "Test Message 10", "Test Subject 10"),
    

    # Add more test data as needed
]

# Please test one API at a time. Comment the other one.
class EmailUser(HttpUser):
    wait_time = between(1, 5)

    @task
    def send_email(self):
        if USER_EMAILS:
            receiver, message, subject = USER_EMAILS.pop(0)  # Use pop(0) to maintain the order
            self.client.post("/api/send-email", data={
                'receivers': receiver,
                'message': message,
                'subject': subject
            })

    @task
    def verify_email(self):
        if USER_EMAILS:
            receiver, message, subject = USER_EMAILS.pop()  # Use pop(0) to maintain the order
            self.client.post("/api/verify-email", data={
                'receiver': receiver,
                'message': message,
                'subject': subject
            })
