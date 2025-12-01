/**
 * SocialAuthButtons Component
 * Google and Apple sign-in buttons
 */

import { Button } from "@/components/ui/Button";

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path
      d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
      fill="#4285F4"
    />
    <path
      d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"
      fill="#34A853"
    />
    <path
      d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
      fill="#FBBC05"
    />
    <path
      d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
      fill="#EA4335"
    />
  </svg>
);

const AppleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
    <path d="M14.315 14.932c-.39.876-.861 1.681-1.414 2.415-.745.994-1.355 1.681-1.824 2.061-.726.663-1.504.995-2.341 1.001-.599 0-1.321-.171-2.162-.518-.844-.345-1.619-.517-2.326-.517-.741 0-1.536.172-2.388.517-.854.347-1.542.528-2.069.545-.802.032-1.6-.31-2.394-1.026-.505-.413-1.142-1.12-1.911-2.124C.794 16.405.225 15.378 0 14.199c-.24-1.27-.361-2.502-.361-3.695 0-1.364.295-2.541.883-3.527a5.19 5.19 0 011.866-1.87 5.024 5.024 0 012.481-.712c.651 0 1.504.201 2.567.595 1.058.396 1.738.597 2.04.597.226 0 .994-.234 2.296-.703 1.232-.434 2.271-.614 3.122-.545 2.307.187 4.039 1.098 5.185 2.74-2.06 1.248-3.082 2.995-3.064 5.235.016 1.745.652 3.2 1.903 4.355.566.543 1.198.963 1.9 1.26-.152.442-.313.865-.485 1.274zM11.025.78c0 1.368-.5 2.645-1.497 3.826-1.203 1.402-2.657 2.21-4.236 2.083a4.265 4.265 0 01-.032-.515c0-1.313.572-2.716 1.586-3.864.506-.579 1.15-1.06 1.93-1.445C9.555.496 10.304.267 11.004.18c.014.2.021.4.021.6z" />
  </svg>
);

export const SocialAuthButtons = ({
  onGoogleClick,
  onAppleClick,
  googleLoading = false,
  appleLoading = false,
}) => {
  return (
    <div className="space-y-3">
      <Button
        type="button"
        variant="secondary"
        size="md"
        fullWidth
        leftIcon={<GoogleIcon />}
        onClick={onGoogleClick}
        loading={googleLoading}
        disabled={googleLoading || appleLoading}
      >
        Sign up with Google
      </Button>

      <Button
        type="button"
        variant="secondary"
        size="md"
        fullWidth
        leftIcon={<AppleIcon />}
        onClick={onAppleClick}
        loading={appleLoading}
        disabled={googleLoading || appleLoading}
      >
        Sign up with Apple
      </Button>
    </div>
  );
};

export default SocialAuthButtons;
