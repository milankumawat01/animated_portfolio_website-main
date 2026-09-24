# Admin redesign — original brief (verbatim)

Reference images: `my_assets/image.png`, `my_assets/image copy.png` (dashboard + empty states), `my_assets/image copy 2.png` (login concept).

You are working on my existing portfolio website's Admin Panel.
Your task is to completely redesign and improve the existing Admin Panel UI/UX while PRESERVING all existing functionality, data structures, API integrations, routes, authentication, CRUD behavior, and backend logic.

DO NOT blindly rewrite the application.
FIRST inspect the existing codebase carefully and understand how the current admin works.

==================================================
PROJECT CONTEXT
==================================================

This is the admin CMS for my personal developer portfolio.

The admin currently manages:

- Projects
- Blog
- Experience
- Skills
- Media
- Leads

The portfolio itself contains mostly static personal/site content, so I intentionally want to REMOVE the old admin settings sections that are rarely changed.

The following old settings/content should NOT remain as regular CMS pages:

- Personal
- Stats & Tech
- About
- Quotes
- Handwriting
- How I Build
- Contact Cards

These should remain static/config-driven on the public portfolio where appropriate.

The Admin Panel should focus on content that I actually update over time.

==================================================
PRIMARY ADMIN STRUCTURE
==================================================

Use this structure:

Dashboard

CONTENT
- Projects
- Blog
- Experience
- Skills
- Media

CRM
- Leads

SYSTEM
- Settings
- Sign out

If Settings currently contains useful authentication/system configuration, preserve only the genuinely necessary settings.
Do NOT bring back the old portfolio-content settings.

==================================================
DESIGN DIRECTION
==================================================

Create a premium, modern, minimal admin dashboard.

Visual direction:

- Light overall interface
- Dark navy/charcoal sidebar
- White content surfaces
- Very subtle gray borders
- Soft shadows
- Rounded cards, but not excessively rounded
- Purple/indigo primary accent
- Small blue/green/orange status accents
- Strong typography hierarchy
- Plenty of whitespace
- Dense enough for productivity, but never cramped
- Professional developer/SaaS dashboard aesthetic
- Avoid generic template-looking UI
- Avoid excessive gradients
- Avoid glassmorphism everywhere
- Avoid giant decorative illustrations
- Avoid unnecessary animations

The interface should feel like a serious production CMS built for a developer.

Do NOT make it look like a social media dashboard.

Do NOT make it look like WhatsApp.

Do NOT make every section into giant cards.

==================================================
IMPORTANT DESIGN PRINCIPLE
==================================================

Before modifying anything:

1. Inspect the existing application.
2. Identify all current admin routes.
3. Identify all API calls.
4. Identify all forms.
5. Identify all CRUD operations.
6. Identify existing reusable components.
7. Identify the current database/data model.
8. Identify current authentication behavior.
9. Identify existing upload/media behavior.
10. Identify validation and error handling.

Then redesign the frontend around the existing functionality.

NEVER remove functionality simply because the current UI doesn't expose it elegantly.

If functionality exists, preserve it.

==================================================
GLOBAL LAYOUT
==================================================

Create a consistent admin shell.

Desktop:

--------------------------------------------------
| Sidebar | Top Header                           |
|         |--------------------------------------|
|         | Page content                         |
|         |                                      |
|         |                                      |
--------------------------------------------------

Sidebar:

Top:
- Milan Admin
- Small "Portfolio CMS" label
- Optional avatar/logo

Navigation:

Dashboard

CONTENT
Projects
Blog
Experience
Skills
Media

CRM
Leads

Bottom:
Settings
Sign out

Active navigation should be clearly visible.

Use icons consistently.

Sidebar should support collapsed mode if the current architecture allows it, but don't introduce unnecessary complexity if it isn't already supported.

Mobile:

- Sidebar becomes a drawer
- Header contains menu button
- Content becomes single-column
- Tables become cards or horizontally scrollable intelligently
- Modals become near-full-screen sheets where appropriate

==================================================
GLOBAL TOP HEADER
==================================================

Create a reusable AdminHeader component.

Include:

- Page title or breadcrumb
- Global search
- Notification/activity icon if supported
- User avatar
- User name
- Account menu

Global search should be visually prominent but compact.

Keyboard shortcut hint:

Ctrl + K

If global search functionality does not currently exist, build the UI component but do not invent backend search behavior unless it can be implemented cleanly using existing data.

==================================================
GLOBAL COMPONENT SYSTEM
==================================================

Create/reuse components such as:

AdminLayout
Sidebar
AdminHeader
Breadcrumbs
PageHeader
SearchInput
FilterBar
Tabs
DataTable
Card
Badge
StatusBadge
DropdownMenu
Pagination
EmptyState
LoadingState
ErrorState
ConfirmDialog
Modal
Drawer
Toast
Tooltip
FormField
FormActions
ImageUploader
MediaPicker
DatePicker
RichTextEditor
TagInput
Select
MultiSelect

Do not create five slightly different versions of the same component.

Use a shared design system.

==================================================
GLOBAL UX RULES
==================================================

Every page must have:

- Loading state
- Empty state
- Error state
- Search/no-results state where applicable
- Success feedback
- Delete confirmation
- Unsaved changes protection where applicable

Destructive actions must require confirmation.

Use toast notifications for successful actions.

Do not use browser alert() or confirm() for production UI.

Forms must have:

- Clear labels
- Helpful placeholders
- Validation messages
- Disabled/loading submit state
- Cancel action
- Save action

Avoid huge forms without grouping.

Use tabs or sections when a form becomes long.

==================================================
1. DASHBOARD
==================================================

Create a polished dashboard.

Page:

Dashboard

Header:
- Dashboard
- Short description
- Date/context card

Stats:

- Total Projects
- Published Posts
- Experiences
- Total Leads

Each stat should show:
- Icon
- Value
- Label
- Optional trend/change indicator

Main content:

Recent Projects
- thumbnail
- title
- short description
- status
- date
- action menu

Recent Blog Posts
- thumbnail
- title
- status
- date
- action menu

Recent Leads
- avatar/initials
- name
- subject
- status
- date

Quick Actions:

- New Project
- New Blog Post
- Add Experience
- Manage Skills

Recent Activity:

- Published blog
- Updated project
- Uploaded media
- New lead
- Updated skills

Dashboard must work with zero data.

Create a beautiful empty dashboard state.

==================================================
2. PROJECTS
==================================================

Page:

Projects

Header:

Projects
Manage projects and showcase work.

Primary button:

+ New Project

Toolbar:

- Search
- Status filter
- Featured filter
- Sort
- View toggle if useful

Statuses:

- Published
- Draft
- Archived

Project list should preferably use a responsive card/grid layout because portfolio projects are visual.

Each project card:

- Cover image
- Title
- Short description
- Technology icons
- Status badge
- Featured indicator
- Updated date
- More actions

Actions:

- Edit
- Preview
- Duplicate
- Archive
- Delete

==================================================
PROJECT CREATE / EDIT
==================================================

Use a proper modal/drawer or full-page editor depending on existing application architecture and form complexity.

Do NOT make a tiny cramped popup for a large project editor.

Sections:

Basic Info
Media
Technology
Links
Content
Visibility

Fields:

Title
Slug
Short Description
Full Description

Cover Image
Gallery

Technologies

Live URL
GitHub URL
Case Study URL

Featured
Published

Create reusable components:

ProjectBasicInfo
ProjectMediaUploader
ProjectTechSelector
ProjectLinks
ProjectContent
ProjectVisibility
ProjectFormActions

Include preview capability.

==================================================
3. BLOG
==================================================

Page:

Blog

Header:
Blog
Manage technical articles and writing.

Primary:
+ New Post

Toolbar:

Search
Status
Category
Sort

Statuses:

Draft
Published
Scheduled
Archived

Each row/card:

- Cover
- Title
- Excerpt
- Category
- Tags
- Reading time
- Status
- Published date
- Actions

Actions:

Edit
Preview
Duplicate
Publish
Schedule
Archive
Delete

==================================================
BLOG EDITOR
==================================================

This is an important screen.

Create a serious writing experience.

Layout:

Main editor area
+
Secondary settings/sidebar

Basic:

Title
Slug
Excerpt

Content editor

Cover

Category
Tags

SEO:
SEO title
SEO description

Publishing:
Draft
Published
Scheduled

Buttons:

Save Draft
Preview
Publish

Use autosave only if existing architecture supports it.
Do not invent a backend autosave system without understanding the codebase.

Create:

BlogBasicInfo
RichTextEditor
BlogCoverUploader
CategorySelector
TagSelector
SEOFields
PublishSettings
BlogPreview

==================================================
4. EXPERIENCE
==================================================

Page:

Experience

Display professional experience as a clean timeline/list.

Each entry:

Company
Role
Employment type
Location
Start date
End date
Current status
Description
Technologies

Actions:

Edit
Delete

Primary:

+ Add Experience

Experience editor should be clean and compact.

Fields:

Company
Role
Employment Type
Location
Start Date
End Date
Currently Working
Description
Technologies
Visible

If "Currently Working" is selected, disable/hide End Date.

==================================================
5. SKILLS
==================================================

Page:

Skills

Categories:

Backend
AI / Machine Learning
Frontend
Database & BaaS
DevOps & Infrastructure
Tools & Others

Use a category + skill management interface.

Layout example:

Left:
Category navigation

Right:
Skills belonging to selected category

Each skill:

Icon
Name
Category
Visibility
Order
Actions

Actions:

Edit
Delete
Move Up
Move Down

Buttons:

+ Add Category
+ Add Skill

Category editor:

Name
Subtitle
Icon
Visibility

Skill editor:

Name
Icon
Category
Visibility

Preserve the current iconKey functionality.

Do not break existing icon mappings.

==================================================
6. MEDIA
==================================================

Create a proper Media Library.

Header:

Media Library
Manage images, videos, documents and portfolio assets.

Primary:

Upload Files

Toolbar:

Search
File type
Sort
Grid/List toggle

Types:

Images
Videos
Documents

Grid view:

Thumbnail
Filename
Type
Size
Dimensions
Updated date

Actions:

Preview
Copy URL
Edit metadata
Replace
Download
Delete

Upload interface:

Drag & drop
Browse files
Upload progress

Media metadata:

Filename
Alt text
Caption
Type
Dimensions
Size
URL
Used in

Create:

MediaLibrary
MediaToolbar
MediaGrid
MediaList
MediaCard
MediaUploadModal
MediaPreviewModal
MediaMetadataForm
MediaPicker

==================================================
MEDIA PICKER
==================================================

This is important because Projects and Blog need to select existing media.

Create a reusable MediaPicker.

It should allow:

- Search
- Filter
- Select one
- Select multiple where needed
- Upload new file
- Preview
- Confirm selection

Do not duplicate media selection UI inside every page.

==================================================
7. LEADS
==================================================

Page:

Leads

This is a CRM-like section.

Header:

Leads
Manage portfolio inquiries and opportunities.

Primary:

+ Add Lead

Toolbar:

Search
Status
Source
Date
Sort

Statuses:

New
Contacted
In Discussion
Converted
Closed

Views:

Table
Optional Kanban

Table:

Name
Email
Subject
Source
Status
Created
Last Contact
Actions

==================================================
LEAD DETAILS
==================================================

Create a detailed lead drawer or modal.

Header:

Lead name
Status
Actions

Contact:

Name
Email
Phone
Company
Source

Message

Notes

Activity timeline

Example activity:

Lead created
Status changed
Note added
Email sent
etc.

Actions:

Change status
Add note
Edit
Archive
Delete

Create:

LeadDetails
LeadContactInfo
LeadMessage
LeadStatus
LeadNotes
LeadTimeline
LeadActions

==================================================
GLOBAL CONFIRMATION MODALS
==================================================

Create reusable confirmation components.

DeleteConfirmation

ArchiveConfirmation

StatusChangeConfirmation

PublishConfirmation

UnsavedChangesConfirmation

Do not create separate visual systems for each.

Use a common ConfirmDialog with configurable:

title
description
danger/warning type
confirm label
cancel label
loading state

==================================================
GLOBAL EMPTY STATES
==================================================

Create reusable EmptyState component.

Examples:

No projects yet
No blog posts yet
No experience added
No leads yet
No media uploaded
No skills in this category

Each empty state should include:

Icon/illustration
Title
Short explanation
Primary action

Keep illustrations minimal and consistent.

==================================================
LOADING STATES
==================================================

Use skeleton loaders.

Do NOT use full-screen spinners for every operation.

Examples:

ProjectCardSkeleton
TableRowSkeleton
DashboardCardSkeleton
BlogListSkeleton
MediaGridSkeleton

Buttons should show loading state while saving.

==================================================
ERROR STATES
==================================================

Use friendly inline error states.

Example:

Something went wrong
We couldn't load your projects.

Retry

Do not expose raw API errors directly to the user.

==================================================
RESPONSIVE DESIGN
==================================================

The admin must work on:

Desktop
Laptop
Tablet
Mobile

Desktop should be the primary design target.

At mobile widths:

- Sidebar becomes drawer
- Tables become cards or intelligently scroll
- Modals become bottom sheets/full-screen where appropriate
- Forms become one column
- Toolbar controls wrap cleanly
- No horizontal overflow
- Buttons remain accessible

==================================================
ACCESSIBILITY
==================================================

Use:

- Proper semantic HTML
- Keyboard navigation
- Focus states
- Accessible dialogs
- Labels for form inputs
- aria-label where needed
- Escape to close modals
- Focus trapping for dialogs
- Sufficient color contrast

Do not rely only on color for status.

==================================================
ANIMATION
==================================================

Use subtle animation only.

Examples:

- Sidebar transitions
- Modal enter/exit
- Dropdown
- Toast
- Card hover
- Skeleton shimmer

Do NOT over-animate the admin.

No unnecessary parallax.

No distracting particle effects.

This is a CMS, not a gaming website.

==================================================
DESIGN TOKENS
==================================================

Establish reusable design tokens.

Primary:
Indigo/Purple

Background:
Very light neutral

Surface:
White

Text:
Dark navy/charcoal

Muted:
Slate/gray

Border:
Very light gray

Success:
Green

Warning:
Orange/amber

Danger:
Red

Info:
Blue

Use consistent:

- Border radius
- Shadows
- Spacing
- Typography
- Button heights
- Input heights
- Badge styles

==================================================
IMPORTANT: PRESERVE EXISTING FUNCTIONALITY
==================================================

Do not break:

- Authentication
- Login
- Logout
- CRUD
- API calls
- Database operations
- File uploads
- Existing routes
- Existing slugs
- Existing IDs
- Existing icon keys
- Existing project/blog relationships
- Existing lead data
- Existing media references

Before changing a data model, inspect the current implementation.

Prefer adapting the existing backend/data model rather than creating unnecessary migrations.

==================================================
DO NOT DO THESE THINGS
==================================================

DO NOT:

- Remove working functionality
- Invent fake backend APIs
- Replace working data fetching with hardcoded mock data
- Change database schemas unnecessarily
- Break existing URLs
- Break authentication
- Create duplicated components
- Create separate confirmation UI for every entity
- Add useless dashboard analytics
- Add unnecessary charts
- Add unnecessary settings
- Bring back static portfolio content into admin
- Make the UI overly colorful
- Use giant cards everywhere
- Use excessive gradients
- Use browser alert/confirm
- Leave placeholder lorem ipsum
- Leave TODOs for obvious UI work
- Stop after creating only the first page

==================================================
IMPLEMENTATION PROCESS
==================================================

Work systematically.

PHASE 1:
Inspect the complete existing admin application.

PHASE 2:
Map existing routes/components/API calls/data models.

PHASE 3:
Create/revise the shared AdminLayout and design system.

PHASE 4:
Redesign all pages:

1. Dashboard
2. Projects
3. Project Create/Edit
4. Blog
5. Blog Create/Edit
6. Experience
7. Skills
8. Media
9. Leads
10. Lead Details

PHASE 5:
Implement shared modals/drawers:

- Confirm dialogs
- Media picker
- Media preview
- Delete confirmation
- Publish confirmation
- Unsaved changes
- Status change
- Notes

PHASE 6:
Implement:

- Loading states
- Empty states
- Error states
- Success toasts
- Responsive states

PHASE 7:
Test every CRUD flow.

==================================================
FINAL QA
==================================================

After implementation, verify:

Dashboard loads correctly.

Projects:
- create
- edit
- preview
- duplicate
- archive
- delete

Blog:
- create
- edit
- preview
- publish
- schedule
- archive
- delete

Experience:
- add
- edit
- delete

Skills:
- add category
- edit category
- delete category
- add skill
- edit skill
- delete skill
- reorder

Media:
- upload
- preview
- edit metadata
- replace
- delete
- select media from picker

Leads:
- create
- edit
- status change
- add note
- archive
- delete
- view activity

Test responsive layouts.

Test keyboard navigation.

Test loading states.

Test empty states.

Test error states.

Fix console errors.

Fix TypeScript errors.

Fix broken imports.

Fix visual overflow.

==================================================
MOST IMPORTANT
==================================================

Do not treat this as a simple visual reskin.

Think through the complete UX of an actual developer using this admin every week.

The result should feel like a polished custom CMS made specifically for Milan's portfolio, not a generic dashboard template.

Keep the public portfolio untouched unless a change is required for compatibility.

Make the admin visually consistent from the first screen to the last.

When something can be solved with a reusable component, create the reusable component instead of duplicating markup.

When something is genuinely unnecessary for a portfolio CMS, keep it out.

Build the complete experience carefully and systematically.s