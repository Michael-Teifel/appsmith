import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import AnalyticsUtil from "utils/AnalyticsUtil";
import TextInput from "components/ads/TextInput";
import Dialog from "components/ads/DialogComponent";
import Button, { Category, Size } from "components/ads/Button";
import { saveSelectedThemeAction } from "actions/appThemingActions";
import { getCurrentApplicationId } from "selectors/editorSelectors";
import { getAppThemes } from "selectors/appThemingSelectors";
import {
  createMessage,
  ERROR_MESSAGE_NAME_EMPTY,
  SPECIAL_CHARACTER_ERROR,
  UNIQUE_NAME_ERROR,
} from "ce/constants/messages";

interface SaveThemeModalProps {
  isOpen: boolean;
  onClose(): void;
}

function SaveThemeModal(props: SaveThemeModalProps) {
  const { isOpen } = props;
  const dispatch = useDispatch();
  const [name, setName] = useState("");
  const [inputValidator, setInputValidator] = useState({
    isValid: false,
    message: "",
  });
  const applicationId = useSelector(getCurrentApplicationId);
  const themes = useSelector(getAppThemes);

  /**
   * dispatches action to save selected theme
   *
   */
  const onSubmit = (event: any) => {
    event.preventDefault();

    // if input validations fails, don't do anything
    if (!inputValidator.isValid) return;

    AnalyticsUtil.logEvent("APP_THEMING_SAVE_THEME_SUCCESS", {
      themeName: name,
    });

    dispatch(saveSelectedThemeAction({ applicationId, name }));

    // close the modal after submit
    onClose();
  };

  /**
   * theme creation validator
   *
   * @param value
   * @returns
   */
  const createThemeValidator = (value: string) => {
    let isValid = !!value;

    let errorMessage = !isValid ? createMessage(ERROR_MESSAGE_NAME_EMPTY) : "";

    if (
      isValid &&
      themes.find((theme) => value.toLowerCase() === theme.name.toLowerCase())
    ) {
      isValid = false;
      errorMessage = createMessage(UNIQUE_NAME_ERROR);
    }

    if (/[^a-zA-Z0-9\-\/]/.test(value)) {
      isValid = false;
      errorMessage = createMessage(SPECIAL_CHARACTER_ERROR);
    }

    return {
      isValid: isValid,
      message: errorMessage,
    };
  };

  /**
   * on input change
   *
   * @param value
   */
  const onChangeName = (value: string) => {
    const validator = createThemeValidator(value);

    setInputValidator(validator);
    setName(value);
  };

  /**
   * on close modal
   */
  const onClose = () => {
    // reset validations
    setInputValidator({
      isValid: true,
      message: "",
    });

    props.onClose();
  };

  return (
    <Dialog
      canOutsideClickClose
      isOpen={isOpen}
      onClose={onClose}
      title="Save Theme"
    >
      <form data-cy="save-theme-form" noValidate onSubmit={onSubmit}>
        <div className="pb-6 space-y-3">
          <p>
            You can save your custom themes to use across applications and use
            them when you need.
          </p>
          <div className="mt-6 space-y-2">
            <h3 className="text-gray-700">Your theme name</h3>
            <TextInput
              autoFocus
              errorMsg={!inputValidator.isValid ? inputValidator.message : ""}
              fill
              name="name"
              onChange={onChangeName}
              placeholder="My theme"
            />
          </div>
        </div>
        {/* <div className="py-6">
          <p className="text-base">Want to share your customised theme?</p>
          <p className="mt-2 text-gray-600">
            You can submit your theme to Appsmith to be included in our as part
            of our prefined themes.
          </p>
          <div className="mt-3">
            <Checkbox label="Submit this theme to Appsmith" />
          </div>
        </div> */}

        <div className="">
          <div className="flex items-center space-x-3">
            <Button
              category={Category.tertiary}
              onClick={onClose}
              size={Size.medium}
              text="Cancel"
            />
            <Button
              category={Category.primary}
              onClick={onSubmit}
              size={Size.medium}
              text="Save theme"
              type="submit"
            />
          </div>
        </div>
      </form>
    </Dialog>
  );
}

export default SaveThemeModal;