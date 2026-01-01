# Custom Toast Notifications

Beautiful toast notifications matching our design system with icons, titles, descriptions, and actions.

## Usage

### Import

```javascript
import { showToast } from "@/utils/toast.utils";
```

### Basic Usage

#### Success Toast

```javascript
showToast.success(
  "Success notification",
  "Your action was completed successfully"
);
```

#### Error Toast

```javascript
showToast.error("Error notification", "Something went wrong. Please try again");
```

#### Warning Toast

```javascript
showToast.warning("Warning notification", "This action may have consequences");
```

#### Info Toast

```javascript
showToast.info(
  "Informational notification",
  "Here's some information you should know"
);
```

### With Action Buttons

```javascript
showToast.success("Quiz submitted successfully!", "View your results now", {
  onAction1: () => navigate("/results"),
  action1Label: "View Results",
  onAction2: () => navigate("/dashboard"),
  action2Label: "Dashboard",
  duration: 5000,
});
```

### Custom Duration

```javascript
showToast.error("Critical Error", "This will stay longer", {
  duration: 10000, // 10 seconds
});
```

## Migration from old toast

### Before

```javascript
import toast from "react-hot-toast";

toast.success("Quiz submitted successfully!");
toast.error("Failed to save answer");
```

### After

```javascript
import { showToast } from "@/utils/toast.utils";

showToast.success("Success", "Quiz submitted successfully!");
showToast.error("Error", "Failed to save answer");
```

## Types

- **success** - Green, with checkmark icon
- **error** - Red, with X circle icon
- **warning** - Amber/Yellow, with alert triangle icon
- **info** - Blue, with info icon

## Features

- ✅ Beautiful design matching our design system
- ✅ Icon-based type indicators
- ✅ Title and message support
- ✅ Optional action buttons
- ✅ Dismissible with close button
- ✅ Auto-dismiss with custom duration
- ✅ Smooth animations
- ✅ Responsive design
