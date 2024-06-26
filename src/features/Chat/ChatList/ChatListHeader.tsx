"use client";
import { Add } from "@mui/icons-material";
import React from "react";
import { Popover } from "@mui/material";

import CreateChatWindow from "./createChatWindow";

const ChatListHeader = () => {
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null,
  );
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  return (
    <div className="flex items-center justify-between h-12 bg-white rounded-sm px-3">
      <span>Chat List</span>
      <button className="ml-4 cursor-pointer" onClick={handleClick}>
        <Add />
      </button>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        sx={{
          height: "60%",
        }}
      >
        <CreateChatWindow />
      </Popover>
    </div>
  );
};

export default ChatListHeader;
