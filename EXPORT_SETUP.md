# Export Functionality Setup

The export buttons in the "Podsumowanie" tab have been implemented but require additional packages to function.

## Required Dependencies

To enable PDF and CSV export functionality, install these packages:

```bash
npm install expo-print expo-sharing expo-file-system
```

## Current Status

✅ **IMPLEMENTED**: Both export functions with proper error handling
✅ **PDF Export**: Generates professional HTML-based PDF with full project details
✅ **CSV Export**: Creates structured CSV file with materials breakdown
✅ **Error Handling**: Shows informative alerts when packages are missing

## Features Included

### PDF Export
- Complete project summary with total cost
- Room-by-room material breakdown  
- Professional styling with tables
- Automatic file naming and sharing

### CSV Export
- Project header information
- Aggregated materials list
- Per-room details
- Proper CSV formatting with quotes and encoding

## User Experience

When packages are not installed:
- Clear error messages explaining what's needed
- No app crashes - graceful degradation
- Instructions provided in alert dialogs

Once packages are installed:
- Instant PDF/CSV generation
- Native share dialog for export
- Proper file naming based on project name

## Testing

After installing packages, test with:
1. A project that has calculated materials
2. Multiple rooms with different material needs
3. Both export buttons to verify functionality 