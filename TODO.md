# TODO: Fix Multiple Food Additions in Charity Page

## Tasks
- [x] Add loading state to DonorDashboard submit button to prevent multiple submissions
- [x] Disable submit button during submission
- [x] Fix charity page delete functionality - handle foreign key constraints with donation logs
- [x] Investigate and fix multiple Hibernate select queries if causing UI issues
- [x] Test the fix to ensure no duplicates appear in charity page

## Information Gathered
- DonorDashboard.js handles food posting via handleSubmitDonation function
- No current prevention for multiple form submissions
- Backend saves each POST request as a new FoodItem
- CharityDashboard displays available food fetched from backend
- Multiple identical food items appear if form is submitted multiple times quickly
- Hibernate logs show the same select query for available food items executed 13 times, possibly due to component re-mounting or page refreshes

## Plan
- Modify DonorDashboard.js to add isSubmitting state
- Set isSubmitting to true on form submit, false on success/error
- Disable submit button when isSubmitting is true
- Add loading indicator if needed
- Investigate why CharityDashboard loadAvailable is called multiple times (possibly due to page refreshes or re-mounts)

## Dependent Files
- frontend/src/pages/DonorDashboard.js
- Possibly frontend/src/pages/CharityDashboard.js if re-mounting issue

## Followup Steps
- Test form submission by clicking submit multiple times rapidly
- Verify in CharityDashboard that no duplicate food items appear
- Check backend logs to confirm single POST per submission
- Monitor Hibernate logs to see if select queries are reduced
