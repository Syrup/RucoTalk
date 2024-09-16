import { ChangeEvent } from "react";

export interface FancyAreaProps {
  textAreaName?: string;
  textAreaId?: string;
  textAreaClassName?: string;
  textAreaValue?: string;
  textAreaReadOnly?: boolean;
  textAreaOnChange?: (e: any) => void;
  textAreaPlaceholder?: string;
}
