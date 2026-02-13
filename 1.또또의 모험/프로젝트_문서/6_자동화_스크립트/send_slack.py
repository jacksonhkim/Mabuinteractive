import sys
import os
from slack_sdk import WebClient
from slack_sdk.errors import SlackApiError

# config.py가 있는 경로 추가
current_dir = os.path.dirname(os.path.abspath(__file__))
config_path = os.path.join(current_dir, 'API_KEY')
sys.path.append(config_path)

try:
    from config import SLACK_TOKEN
except ImportError:
    print("Error: 'config.py' not found in API_KEY directory or SLACK_TOKEN is missing.")
    sys.exit(1)

def send_slack_message(token, channel, text):
    client = WebClient(token=token)
    try:
        response = client.chat_postMessage(
            channel=channel,
            text=text
        )
        print(f"Message sent successfully: {response['ts']}")
    except SlackApiError as e:
        print(f"Error sending message: {e.response['error']}")

if __name__ == "__main__":
    # 기본 채널 설정 (config.py에 CHANNEL_ID가 없으면 '#general' 사용)
    try:
        from config import CHANNEL_ID
        channel = CHANNEL_ID
    except ImportError:
        channel = "#general"

    message = "헬로 월드! 안티그래비티에서 보냄"
    
    print(f"Sending message to {channel}...")
    send_slack_message(SLACK_TOKEN, channel, message)
