import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "./dropdown-menu";
import { Menu, Package2, CircleUser } from "lucide-react";
import { Link, useLocation } from "@remix-run/react";
import { Button } from "./button";
import { SheetTrigger, SheetContent, Sheet } from "./sheet";

function NavLinks({
  active,
  device,
}: {
  active: string;
  device: "mobile" | "desktop";
}) {
  if (device === "mobile") {
    return (
      <nav className="grid gap-6 text-lg font-medium">
        <Link to="#" className="flex items-center gap-2 text-lg font-semibold">
          <Package2 className="w-6 h-6" />
          <span className="sr-only">Acme Inc</span>
        </Link>
        <Link
          to="/"
          className={`${
            active === "" ? "text-foreground" : "text-muted-foreground"
          } hover:text-foreground`}
        >
          Home
        </Link>
        <Link
          to="/dashboard"
          className={`${
            active === "dashboard" ? "text-foreground" : "text-muted-foreground"
          } hover:text-foreground`}
        >
          Dashboard
        </Link>
        <Link to="#" className="text-muted-foreground hover:text-foreground">
          Products
        </Link>
        <Link to="#" className="text-muted-foreground hover:text-foreground">
          Customers
        </Link>
        <Link to="#" className="text-muted-foreground hover:text-foreground">
          Analytics
        </Link>
      </nav>
    );
  } else if (device === "desktop") {
    return (
      <nav className="flex-col hidden gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
        <Link
          to="#"
          className="flex items-center gap-2 text-lg font-semibold md:text-base"
        >
          <Package2 className="w-6 h-6" />
          <span className="sr-only">Acme Inc</span>
        </Link>
        <Link
          to="/"
          className={`transition-colors ${
            active === "" ? "text-foreground" : "text-muted-foreground"
          } hover:text-foreground`}
        >
          Home
        </Link>
        <Link
          to="/dashboard"
          className={`transition-colors ${
            active === "dashboard" ? "text-foreground" : "text-muted-foreground"
          } hover:text-foreground`}
        >
          Dashboard
        </Link>
        <Link
          to="#"
          className="transition-colors text-muted-foreground hover:text-foreground"
        >
          Products
        </Link>
        <Link
          to="#"
          className="transition-colors text-muted-foreground hover:text-foreground"
        >
          Customers
        </Link>
        <Link
          to="#"
          className="transition-colors text-muted-foreground hover:text-foreground"
        >
          Analytics
        </Link>
      </nav>
    );
  }
}

export default function Navbar() {
  const location = useLocation();
  const active = location.pathname.split("/")[1];
  console.log(active);

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
            <NavLinks active={active} device="mobile" />
          </SheetContent>
        </Sheet>

        {/* Logo and Links for Desktop */}
        <NavLinks active={active} device="desktop"></NavLinks>
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
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Support</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
