import React from "react";

const BreadcrumbContext = React.createContext<{
  breadcrumbs: { link: string; label: string }[] | null;
  setBreadcrumbs: any;
}>({
  breadcrumbs: null,
  setBreadcrumbs: () => {},
});

export const useBreadcrumbs = () => React.useContext(BreadcrumbContext);

export const BreadcrumbProvider = ({ children }: any) => {
  const [breadcrumbs, setBreadcrumbs] = React.useState<any>(null);

  return (
    <BreadcrumbContext.Provider value={{ breadcrumbs, setBreadcrumbs }}>
      {children}
    </BreadcrumbContext.Provider>
  );
};
