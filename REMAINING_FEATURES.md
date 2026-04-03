# AI Design Studio - Remaining Features Audit

This document outlines the features and functionalities identified in the `features.md` blueprint that are currently missing or incomplete in the implementation.

## 1. Advanced AI Generator Capabilities
*   **Prompt Enhancement & Parameter Extraction**: AI-powered rewriting of prompts for better results and the ability to automatically identify and expose parameters (like "3 columns", "primary color") as editable fields before generating.
*   **Clarifying Questions**: The generator flow does not yet support the AI asking follow-up questions (e.g., "Would you like a dark or light theme?") before producing the final design.
*   **Design-to-Design Translation**: Specific "translation" workflows such as "Wireframe to High-Fidelity" or "Convert to Dark Mode" are not yet implemented as dedicated features.
*   **Design Assembly**: A drag-and-drop interface for combining multiple generated components (e.g., a Navbar from one generation and a Hero section from another) into a single page layout.

* Ui Ux agent 
## 2. Canvas & Preview Enhancements
*   **Advanced Canvas Tools**: Ruler guides, grid overlays, and interactive element highlighting (showing the layer name/ID on hover) are missing from the preview canvas.
*   **Direct Element Selection**: The ability to click directly on an element within the SVG canvas to view and edit its specific properties in the sidebar.
*   **Real-time Layer Controls**: While a Layers panel exists, it currently lacks visibility toggles (hide/show) for individual elements.

## 3. Collaboration & Social Features - not now
*   **Link Sharing & Permissions**: Generating public/private shareable links for designs and managing granular edit/view permissions for other users.
*   **Commenting System**: On-design commenting with @mentions and threaded replies for collaborative review.
*   **Team Workspaces**: Shared project areas and organization-level resource management.
*   **Public Gallery**: An opt-in gallery for users to showcase their generated designs to the community.

## 4. Versioning & History
*   **Named Versions**: The ability to save specific "snapshots" of a design with names (similar to Figma's version history).
*   **Branching & Merging**: Forking a design's history to explore variations and merging those changes back into a main project.
*   **Side-by-Side Comparison**: A dedicated view to compare different versions or variations of a design.

## 5. Project Management
*   **Hierarchical Folders**: The current system uses a flat project list; nested folders with drag-and-drop organization are not yet implemented.
*   **Collections**: A way to save and tag favorite generations into curated "Collections" across different projects.

## 6. Quality & Feedback
*   **Design Lint**: A user-facing tool to analyze generated SVGs for accessibility (contrast), spacing, and alignment issues with suggested fixes.
*   **Human Feedback Loop**: Structured "Thumbs Up/Down" buttons with a feedback form to help fine-tune the AI model's output quality over time.
*   **Advanced SVG Optimization**: A dedicated pipeline stage to minimize path data and merge overlapping elements beyond the current basic cleaning.

## 7. code export i to html, css also in reactjs , two options to exporta
