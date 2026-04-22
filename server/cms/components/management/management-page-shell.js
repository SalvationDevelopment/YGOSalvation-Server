"use client";

/**
 * Renders the Management Page Shell component and returns the UI used by the management page shell view.
 * @param {Object} props The props object supplies the structured input used by the management page shell module, including the `children`, `description`, `onSearchFieldChange`, `onSearchValueChange`, `searchField`, `searchFieldOptions`, `searchFieldOptions[]`, `searchValue`, and `title` properties.
 * @param {React.ReactNode} props.children The `children` property supplies structured input used by the management page shell module.
 * @param {string} props.description The `description` property supplies structured input used by the management page shell module.
 * @param {(value: string) => void} props.onSearchFieldChange The `onSearchFieldChange` property supplies structured input used by the management page shell module.
 * @param {(value: string) => void} props.onSearchValueChange The `onSearchValueChange` property supplies structured input used by the management page shell module.
 * @param {string} props.searchField The `searchField` property supplies structured input used by the management page shell module.
 * @param {Array} props.searchFieldOptions The `searchFieldOptions` property supplies structured input used by the management page shell module.
 * @param {string} props.searchFieldOptions[].label The `searchFieldOptions[].label` property supplies structured input used by the management page shell module.
 * @param {string} props.searchFieldOptions[].value The `searchFieldOptions[].value` property supplies structured input used by the management page shell module.
 * @param {string} props.searchValue The `searchValue` property supplies structured input used by the management page shell module.
 * @param {string} props.title The `title` property supplies structured input used by the management page shell module.
 * @returns {React.ReactNode} Returns the rendered UI used by the management page shell view.
 */
export default function ManagementPageShell({
  title,
  description,
  searchValue,
  onSearchValueChange,
  searchField,
  onSearchFieldChange,
  searchFieldOptions,
  children
}) {
  return (
    <section className="panel glass management-shell">
      <header className="management-header">
        <div>
          <h1>{title}</h1>
          {description ? <p className="muted">{description}</p> : null}
        </div>
        <div className="search-controls">
          <select value={searchField} onChange={(event) => onSearchFieldChange(event.target.value)}>
            {searchFieldOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <input
            value={searchValue}
            onChange={(event) => onSearchValueChange(event.target.value)}
            placeholder="Search entries"
          />
        </div>
      </header>
      {children}
    </section>
  );
}
