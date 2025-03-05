ENV_FILE = .env

.PHONY: generate-env

generate-env:
	@echo "Creating/truncating $(ENV_FILE)..."
	@touch "$(ENV_FILE)" || (echo "Error: Failed to create/truncate $(ENV_FILE)" >&2 && exit 1)
	@echo "Writing environment variables..."
	@echo "REACT_APP_API_URL=http://localhost:8080/api" >> "$(ENV_FILE)" || (echo "Error: Failed to write REACT_APP_API_URL to $(ENV_FILE)" >&2 && exit 1)
	@echo "REACT_APP_MAP_DEFAULT_LAT=50.7184" >> "$(ENV_FILE)" || (echo "Error: Failed to write REACT_APP_MAP_DEFAULT_LAT to $(ENV_FILE)" >&2 && exit 1)
	@echo "REACT_APP_MAP_DEFAULT_LNG=-3.5339" >> "$(ENV_FILE)" || (echo "Error: Failed to write REACT_APP_MAP_DEFAULT_LNG to $(ENV_FILE)" >&2 && exit 1)
	@echo "REACT_APP_MAP_DEFAULT_ZOOM=13" >> "$(ENV_FILE)" || (echo "Error: Failed to write REACT_APP_MAP_DEFAULT_ZOOM to $(ENV_FILE)" >&2 && exit 1)
	@echo "REACT_APP_ENABLE_NOTIFICATIONS=true" >> "$(ENV_FILE)" || (echo "Error: Failed to write REACT_APP_ENABLE_NOTIFICATIONS to $(ENV_FILE)" >&2 && exit 1)
	@echo "REACT_APP_ENABLE_IMAGE_UPLOAD=true" >> "$(ENV_FILE)" || (echo "Error: Failed to write REACT_APP_ENABLE_IMAGE_UPLOAD to $(ENV_FILE)" >&2 && exit 1)
	@echo "REACT_APP_SITE_TITLE=Chalkstone Council Reports" >> "$(ENV_FILE)" || (echo "Error: Failed to write REACT_APP_SITE_TITLE to $(ENV_FILE)" >&2 && exit 1)
	@echo "REACT_APP_DEFAULT_PAGE_SIZE=10" >> "$(ENV_FILE)" || (echo "Error: Failed to write REACT_APP_DEFAULT_PAGE_SIZE to $(ENV_FILE)" >&2 && exit 1)
	@echo "$(ENV_FILE) created/updated successfully."

.PHONY: clean
clean:
	@rm -f $(ENV_FILE)
	@echo "$(ENV_FILE) deleted."