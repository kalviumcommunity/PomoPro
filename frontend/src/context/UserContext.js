import React, { createContext, useContext, useMemo, useState } from 'react';

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [focusGoalHours, setFocusGoalHours] = useState(0);

  const value = useMemo(() => ({ focusGoalHours, setFocusGoalHours }), [focusGoalHours]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
}


