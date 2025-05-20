// client/src/components/panels/withAutoRefresh.jsx

import { useEffect } from "react";

export default function withAutoRefresh(WrappedComponent, interval = 30000) {
  return function (props) {
    useEffect(() => {
      const id = setInterval(() => {
        if (typeof props.onRefresh === "function") props.onRefresh();
      }, interval);
      return () => clearInterval(id);
    }, []);
    return <WrappedComponent {...props} />;
  };
}
