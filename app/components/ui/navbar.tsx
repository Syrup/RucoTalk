import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "./dropdown-menu";
import { Separator } from "./separator";
import { Menu, Package2, CircleUser } from "lucide-react";
import { Link, useLocation } from "@remix-run/react";
import { Button } from "./button";
import { SheetTrigger, SheetContent, Sheet } from "./sheet";
import { useEffect, useState } from "react";
import { LoginCookie } from "~/types";
import { SerializeFrom } from "@remix-run/node";
import { ZodNull } from "zod";

type SerializeLoginCookie = SerializeFrom<LoginCookie>;

function NavLinks({
  active,
  device,
  user,
}: {
  active: string;
  device: "mobile" | "desktop";
  user: SerializeLoginCookie | null;
}) {
  console.log(user?.isLoggedIn);

  if (device === "mobile") {
    return (
      <nav className="grid gap-6 text-lg font-medium">
        <Link
          to="#"
          className="flex items-center gap-2 text-lg font-semibold hover:no-underline"
        >
          <Package2 className="w-6 h-6" />
          <span className="sr-only">RucoTalk</span>
        </Link>
        <Link
          to="/"
          className={`${
            active === "" ? "text-foreground" : "text-muted-foreground"
          } hover:text-foreground hover:no-underline`}
        >
          Home
        </Link>
        {user?.isLoggedIn ? (
          <Link
            to="/dashboard"
            className={`${
              active === "dashboard"
                ? "text-foreground"
                : "text-muted-foreground"
            } hover:text-foreground hover:no-underline`}
          >
            Dashboard
          </Link>
        ) : null}
        <Link
          to="#"
          className="text-muted-foreground hover:text-foreground hover:no-underline"
        >
          Tentang Kami
        </Link>
      </nav>
    );
  } else if (device === "desktop") {
    return (
      <nav className="flex-col hidden gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
        <Link
          to="#"
          className="flex items-center gap-2 text-lg font-semibold md:text-base hover:no-underline"
        >
          <Package2 className="w-6 h-6" />
          <span className="sr-only">RucoTalk</span>
        </Link>
        <Link
          to="/"
          className={`transition-colors ${
            active === "" ? "text-foreground" : "text-muted-foreground"
          } hover:text-foreground hover:no-underline`}
        >
          Home
        </Link>
        {user?.isLoggedIn ? (
          <Link
            to="/dashboard"
            className={`${
              active === "dashboard"
                ? "text-foreground"
                : "text-muted-foreground"
            } hover:text-foreground hover:no-underline`}
          >
            Dashboard
          </Link>
        ) : (
          ""
        )}
        <Link
          to="/about"
          className="text-muted-foreground hover:text-foreground hover:no-underline"
        >
          Tentang Kami
        </Link>
      </nav>
    );
  }
}

export default function Navbar({
  user,
}: {
  user: SerializeLoginCookie | null;
}) {
  const location = useLocation();
  const active = location.pathname.split("/")[1];

  console.log(user);

  return (
    <header className="sticky top-0 flex items-center justify-between w-full h-16 gap-4 px-4 border-b bg-background md:px-6">
      <div className="flex items-center justify-between w-full md:w-auto">
        {/* Menu Button for Mobile */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden">
              <Menu className="w-5 h-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <NavLinks active={active} device="mobile" user={user} />
          </SheetContent>
        </Sheet>

        {/* Logo and Links for Desktop */}
        <NavLinks active={active} device="desktop" user={user} />
      </div>

      {/* User Icon */}
      <div className="flex items-center gap-4 ml-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="rounded-full">
              <CircleUser className="w-5 h-5" />
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {user !== null && user.isLoggedIn ? (
              <>
                <DropdownMenuLabel>
                  Welcome, {user.user.username}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    window.location.href = "/auth/logout";
                  }}
                >
                  <a
                    href="/auth/logout"
                    className="hover:no-underline text-inherit hover:text-black/35"
                  >
                    Logout
                  </a>
                </DropdownMenuItem>
              </>
            ) : (
              <DropdownMenuItem
                onClick={() => {
                  window.location.href = "/login";
                }}
              >
                <a
                  href="/login"
                  className="hover:no-underline text-inherit hover:text-black/35"
                >
                  Login
                </a>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
