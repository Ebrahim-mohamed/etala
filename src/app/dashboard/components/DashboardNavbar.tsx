import { NavbarLink } from "./NavbarLink";

export function DashboardNavbar() {
  return (
    <div className="flex flex-col w-[20%] px-10">
      <NavbarLink name="Create a building" link="create-building" />
      <NavbarLink name="Trace floors" link="create-building" />
      <NavbarLink name="Appartement allocation" link="unit-allocation" />
      <NavbarLink name="Gallery" link="gallery" />
      <NavbarLink name="Inquiry Form" link="inquiry-form" />
      <NavbarLink name="Share Module" link="share-module" />
      {/* <NavbarLink name="Payment" link="payment" /> */}
    </div>
  );
}
