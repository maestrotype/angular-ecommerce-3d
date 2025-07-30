# 🎨 Admin Panel UI System

## ✅ What's implemented

### 🎯 Main components:

#### **1. Variable System (`admin-variables.scss`)**
- **Color palette** for all admin panel elements
- **Theme support**: Default, Dark, Glass
- **Spacing, Typography, Z-Index** variables
- **Border Radius** and other constants

#### **2. Mixins (`admin-mixins.scss`)**
- **Card, Button, Form** styles
- **Layout, Typography** mixins
- **Animation, Responsive** utilities
- **Status** styles for errors/success

#### **3. Global Styles (`admin-global.scss`)**
- **Material Design** components
- **Snackbar, Dialog, Form** styles
- **Table, Paginator, Select** styles
- **Checkbox, Radio, Slide Toggle** styles

#### **4. Error Handling Module**
- **ErrorHandlerService** - centralized error handling
- **ErrorDialogComponent** - beautiful error dialogs
- **Specialized** methods for different error types

## 🚀 How to use

### **1. Connecting styles**
```typescript
// Already connected in admin.module.ts:
import './styles/admin-variables.scss';
import './styles/admin-mixins.scss';
import './styles/admin-global.scss';
```

### **2. Using variables**
```scss
.my-component {
  background: var(--admin-bg-card);
  color: var(--admin-text-primary);
  border: 1px solid var(--admin-border-primary);
  padding: var(--admin-spacing-lg);
  border-radius: var(--admin-radius-md);
}
```

### **3. Using mixins**
```scss
.my-card {
  @include admin-card;
  
  &:hover {
    @include admin-card-hover;
  }
}

.my-button {
  @include admin-button-primary;
}

.my-form-field {
  @include admin-form-field;
}
```

### **4. Error handling**
```typescript
constructor(private errorHandler: ErrorHandlerService) {}

// Simple notifications
this.errorHandler.showSuccess('Operation completed successfully!');
this.errorHandler.showError('An error occurred');
this.errorHandler.showWarning('Warning');
this.errorHandler.showInfo('Information');

// Specialized errors
this.errorHandler.showImageProcessingError(error);
this.errorHandler.showDatabaseError(error);
this.errorHandler.showNetworkError(error);
this.errorHandler.showValidationError(['Error 1', 'Error 2']);

// Dialogs with details
this.errorHandler.showErrorWithDialog({
  title: 'Error',
  message: 'Error description',
  details: 'Technical details',
  type: 'error',
  action: 'Retry'
});
```

## 🎨 Color system

### **Primary colors:**
- `--admin-primary`: #1976d2 (blue)
- `--admin-secondary`: #dc004e (pink)
- `--admin-success`: #4caf50 (green)
- `--admin-warning`: #ff9800 (orange)
- `--admin-error`: #f44336 (red)
- `--admin-info`: #2196f3 (cyan)

### **Background colors:**
- `--admin-bg-primary`: #fafafa (main background)
- `--admin-bg-secondary`: #ffffff (secondary background)
- `--admin-bg-tertiary`: #f5f5f5 (tertiary background)
- `--admin-bg-card`: #ffffff (card background)

### **Text colors:**
- `--admin-text-primary`: rgba(0, 0, 0, 0.87) (main text)
- `--admin-text-secondary`: rgba(0, 0, 0, 0.6) (secondary text)
- `--admin-text-disabled`: rgba(0, 0, 0, 0.38) (disabled text)
- `--admin-text-inverse`: #ffffff (inverted text)

## 📱 Responsiveness

### **Breakpoints:**
```scss
@include admin-responsive(mobile) {
  // Mobile styles
}

@include admin-responsive(tablet) {
  // Tablet styles
}

@include admin-responsive(desktop) {
  // Desktop styles
}
```

## 🎭 Theme support

### **Default Theme:**
- Light theme with Material Design
- Standard colors and contrast

### **Dark Theme:**
```scss
[data-theme="dark"] {
  --admin-bg-primary: #121212;
  --admin-bg-secondary: #1e1e1e;
  --admin-text-primary: rgba(255, 255, 255, 0.87);
}
```

### **Glass Theme:**
```scss
[data-theme="glass"] {
  --admin-bg-primary: rgba(255, 255, 255, 0.1);
  --admin-bg-card: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}
```

## 🔧 Components

### **Card Component:**
```scss
.admin-card {
  @include admin-card;
  
  &:hover {
    @include admin-card-hover;
  }
}
```

### **Button Components:**
```scss
.admin-button-primary {
  @include admin-button-primary;
}

.admin-button-secondary {
  @include admin-button-secondary;
}

.admin-button-danger {
  @include admin-button-danger;
}
```

### **Form Components:**
```scss
.admin-form-field {
  @include admin-form-field;
}

.admin-form-label {
  @include admin-form-label;
}
```

### **Status Components:**
```scss
.admin-status-success {
  @include admin-status-success;
}

.admin-status-warning {
  @include admin-status-warning;
}

.admin-status-error {
  @include admin-status-error;
}

.admin-status-info {
  @include admin-status-info;
}
```

## 📊 Usage examples

### **1. Creating a card:**
```scss
.product-card {
  @include admin-card;
  
  .product-title {
    @include admin-heading(3);
  }
  
  .product-description {
    @include admin-text;
  }
  
  .product-price {
    @include admin-text;
    color: var(--admin-primary);
    font-weight: 500;
  }
  
  .product-actions {
    @include admin-row;
    
    .action-button {
      @include admin-button-primary;
    }
  }
}
```

### **2. Creating a form:**
```scss
.product-form {
  @include admin-container;
  
  .form-group {
    @include admin-row;
    
    .form-field {
      @include admin-col(1);
      
      label {
        @include admin-form-label;
      }
      
      input {
        @include admin-form-field;
      }
    }
  }
  
  .form-actions {
    display: flex;
    gap: var(--admin-spacing-md);
    justify-content: flex-end;
    
    .submit-button {
      @include admin-button-primary;
    }
    
    .cancel-button {
      @include admin-button-secondary;
    }
  }
}
```

### **3. Error handling:**
```typescript
export class MyComponent {
  constructor(private errorHandler: ErrorHandlerService) {}
  
  saveData() {
    this.dataService.save(this.data).subscribe({
      next: () => {
        this.errorHandler.showSuccess('Data saved successfully!');
      },
      error: (error) => {
        if (error.status === 0) {
          this.errorHandler.showNetworkError(error);
        } else if (error.status === 400) {
          this.errorHandler.showValidationError(error.errors);
        } else {
          this.errorHandler.showErrorWithDialog({
            title: 'Save error',
            message: 'Failed to save data',
            details: error.message,
            type: 'error',
            action: 'Retry',
            actionCallback: () => this.saveData()
          });
        }
      }
    });
  }
}
```

## 🎯 System advantages

### **✅ Consistency:**
- Unified color palette
- Standardized components
- Predictable behavior

### **✅ Scalability:**
- Easy to add new themes
- Simple component extension
- Modular architecture

### **✅ Support:**
- Centralized error handling
- Clear user messages
- Detailed information for developers

### **✅ Responsiveness:**
- Automatic device adaptation
- Mobile optimization
- Flexible breakpoint system

## 🚀 Ready to use!

The system is fully integrated into the admin panel and ready to use. All components use new variables and mixins, ensuring a consistent and professional appearance.

**🎉 Now the admin panel has a modern, consistent and scalable UI system!** 