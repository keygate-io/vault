"use client";

import { AbsoluteCenter, Menu as ChakraMenu, Portal } from "@chakra-ui/react";
import * as React from "react";
import { LuCheck, LuChevronRight } from "react-icons/lu";

export const MenuContent = React.forwardRef(function MenuContent(props, ref) {
  const { portalled = true, portalRef, ...rest } = props;
  return (
    <Portal disabled={!portalled} container={portalRef}>
      <ChakraMenu.Positioner>
        <ChakraMenu.Content ref={ref} {...rest} />
      </ChakraMenu.Positioner>
    </Portal>
  );
});

export const MenuArrow = React.forwardRef(function MenuArrow(props, ref) {
  return (
    <ChakraMenu.Arrow ref={ref} {...props}>
      <ChakraMenu.ArrowTip />
    </ChakraMenu.Arrow>
  );
});

export const MenuCheckboxItem = React.forwardRef(function MenuCheckboxItem(
  props,
  ref
) {
  return (
    <ChakraMenu.CheckboxItem ps="8" ref={ref} {...props} userSelect="text">
      <AbsoluteCenter axis="horizontal" insetStart="4" asChild>
        <ChakraMenu.ItemIndicator>
          <LuCheck />
        </ChakraMenu.ItemIndicator>
      </AbsoluteCenter>
      {props.children}
    </ChakraMenu.CheckboxItem>
  );
});

export const MenuRadioItem = React.forwardRef(function MenuRadioItem(
  props,
  ref
) {
  const { children, ...rest } = props;
  return (
    <ChakraMenu.RadioItem ps="8" ref={ref} {...rest} userSelect="text">
      <AbsoluteCenter axis="horizontal" insetStart="4" asChild>
        <ChakraMenu.ItemIndicator>
          <LuCheck />
        </ChakraMenu.ItemIndicator>
      </AbsoluteCenter>
      <ChakraMenu.ItemText>{children}</ChakraMenu.ItemText>
    </ChakraMenu.RadioItem>
  );
});

export const MenuItemGroup = React.forwardRef(function MenuItemGroup(
  props,
  ref
) {
  const { title, children, ...rest } = props;
  return (
    <ChakraMenu.ItemGroup ref={ref} {...rest}>
      {title && <ChakraMenu.ItemGroupLabel>{title}</ChakraMenu.ItemGroupLabel>}
      {children}
    </ChakraMenu.ItemGroup>
  );
});

export const MenuTriggerItem = React.forwardRef(function MenuTriggerItem(
  props,
  ref
) {
  const { startIcon, children, ...rest } = props;
  return (
    <ChakraMenu.TriggerItem ref={ref} {...rest} userSelect="text">
      {startIcon}
      {children}
      <LuChevronRight />
    </ChakraMenu.TriggerItem>
  );
});

export const MenuRadioItemGroup = ChakraMenu.RadioItemGroup;
export const MenuContextTrigger = ChakraMenu.ContextTrigger;
export const MenuRoot = ChakraMenu.Root;
export const MenuSeparator = ChakraMenu.Separator;

export const MenuItem = React.forwardRef(function MenuItem(props, ref) {
  return <ChakraMenu.Item ref={ref} {...props} userSelect="text" />;
});

export const MenuItemText = React.forwardRef(function MenuItemText(props, ref) {
  return <ChakraMenu.ItemText ref={ref} {...props} userSelect="text" />;
});

export const MenuItemCommand = React.forwardRef(function MenuItemCommand(
  props,
  ref
) {
  return <ChakraMenu.ItemCommand ref={ref} {...props} userSelect="text" />;
});

export const MenuTrigger = ChakraMenu.Trigger;
