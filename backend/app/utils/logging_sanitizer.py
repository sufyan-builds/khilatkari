import re
import logging

# Regex patterns to scrub sensitive data from log strings
MONGO_URI_PATTERN = re.compile(r"(mongodb(?:\+srv)?://)[^@]+@", re.IGNORECASE)
BEARER_TOKEN_PATTERN = re.compile(r"(Bearer\s+)[A-Za-z0-9\-_.]+", re.IGNORECASE)
JWT_PATTERN = re.compile(r"eyJ[A-Za-z0-9-_=]+\.eyJ[A-Za-z0-9-_=]+\.[A-Za-z0-9-_.+/=]*")
PASSWORD_KEY_PATTERN = re.compile(r'((?:password|secret|access_token|authorization)["\']?\s*[:=]\s*["\'])[^"\']+(["\'])', re.IGNORECASE)


def sanitize_log_message(msg: str) -> str:
    """
    Remove secrets, passwords, MongoDB connection strings, and JWT tokens
    from log output to prevent credential leakage.
    """
    if not isinstance(msg, str):
        msg = str(msg)
    msg = MONGO_URI_PATTERN.sub(r"\1***:***@", msg)
    msg = BEARER_TOKEN_PATTERN.sub(r"\1***", msg)
    msg = JWT_PATTERN.sub(r"***JWT***", msg)
    msg = PASSWORD_KEY_PATTERN.sub(r"\1***\2", msg)
    return msg


class SecretScrubbingFilter(logging.Filter):
    """
    Logging filter that sanitizes record messages and arguments before writing to log handlers.
    """
    def filter(self, record: logging.LogRecord) -> bool:
        try:
            if record.msg and isinstance(record.msg, str):
                record.msg = sanitize_log_message(record.msg)
            if record.args:
                if isinstance(record.args, dict):
                    record.args = {k: sanitize_log_message(str(v)) for k, v in record.args.items()}
                elif isinstance(record.args, (list, tuple)):
                    record.args = tuple(sanitize_log_message(str(a)) for a in record.args)
        except Exception:
            pass
        return True
