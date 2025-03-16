import React, { useState, useEffect } from "react";
import { Button, Dropdown, Form } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import "./VisualizationSettings.css";

const VisualizationSettings = ({ availableTags, onFilterChange }) => {
  const { t } = useTranslation();

  const [filterMode, setFilterMode] = useState("or");
  const [showModeDropdown, setShowModeDropdown] = useState(false);
  const [checkedTags, setCheckedTags] = useState({});

  useEffect(() => {
    const newChecked = {};
    availableTags.forEach((tag) => {
      newChecked[tag.tagId] = filterMode === "or";
    });
    setCheckedTags(newChecked);
  }, [availableTags, filterMode]);

  const toggleCheckAll = () => {
    const allChecked = Object.values(checkedTags).every((v) => v === true);
    const newChecked = {};
    Object.keys(checkedTags).forEach((tagId) => {
      newChecked[tagId] = !allChecked;
    });
    setCheckedTags(newChecked);
  };

  const groupedTags = {};
  availableTags.forEach((tag) => {
    const group = tag.tagTypeName || "Other";
    if (!groupedTags[group]) groupedTags[group] = [];
    groupedTags[group].push(tag);
  });

  const sortedGroups = Object.keys(groupedTags)
    .sort((a, b) => a.localeCompare(b))
    .map((groupName) => ({
      groupName,
      tags: groupedTags[groupName].sort((a, b) =>
        a.tagName.localeCompare(b.tagName)
      ),
    }));

  const handleApply = () => {
    const checkedIds = Object.keys(checkedTags)
      .filter((tagId) => checkedTags[tagId])
      .map((id) => Number(id));
    onFilterChange({ filterMode, checkedIds });
  };

  return (
    <div className="visualization-settings-panel">
      <div className="vs-header">
        <Button
          variant="outline-primary"
          onClick={() => setShowModeDropdown(!showModeDropdown)}
        >
          {filterMode === "or"
            ? t("visualSettings.filterOr", "Filter with 'or'")
            : t("visualSettings.filterAnd", "Filter with 'and'")}
        </Button>
      </div>
      {showModeDropdown && (
        <div className="vs-dropdown">
          <Dropdown>
            <Dropdown.Toggle variant="light" id="filter-mode-dropdown">
              {t("visualSettings.selectFilterMode", "Select filter mode")}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => setFilterMode("or")}>
                {t("visualSettings.filterOr", "Filter with 'or'")}
              </Dropdown.Item>
              <Dropdown.Item onClick={() => setFilterMode("and")}>
                {t("visualSettings.filterAnd", "Filter with 'and'")}
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          <div className="vs-controls">
            <Button
              variant="outline-secondary"
              className="vs-check-all"
              onClick={toggleCheckAll}
            >
              {t("visualSettings.checkAll", "Check All")}
            </Button>
            <Button
              variant="primary"
              className="vs-apply"
              onClick={handleApply}
            >
              {t("visualSettings.apply", "Apply")}
            </Button>
          </div>
          <div className="vs-checkboxes">
            {sortedGroups.map((group) => (
              <div key={group.groupName} className="vs-group">
                <div className="vs-group-label">{group.groupName}</div>
                {group.tags.map((tag) => (
                  <Form.Check
                    key={tag.tagId}
                    type="checkbox"
                    id={`tag-${tag.tagId}`}
                    label={tag.tagName}
                    checked={!!checkedTags[tag.tagId]}
                    onChange={(e) =>
                      setCheckedTags({
                        ...checkedTags,
                        [tag.tagId]: e.target.checked,
                      })
                    }
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VisualizationSettings;
