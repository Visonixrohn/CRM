import React, { createContext, useContext, useRef } from "react";

const NavigationContext = createContext();

export function NavigationProvider({ children }) {
	// Usar un stack en localStorage para historial
	const stackRef = useRef([]);

	// Inicializar stack desde localStorage
	if (stackRef.current.length === 0) {
		const saved = localStorage.getItem("crm-nav-stack");
		stackRef.current = saved ? JSON.parse(saved) : [];
	}

	const push = (view) => {
		stackRef.current.push(view);
		localStorage.setItem("crm-nav-stack", JSON.stringify(stackRef.current));
	};
	const pop = () => {
		if (stackRef.current.length > 1) {
			stackRef.current.pop();
			localStorage.setItem("crm-nav-stack", JSON.stringify(stackRef.current));
			return stackRef.current[stackRef.current.length - 1];
		}
		return stackRef.current[0] || "comisiones";
	};
	const reset = (view = "comisiones") => {
		stackRef.current = [view];
		localStorage.setItem("crm-nav-stack", JSON.stringify(stackRef.current));
	};
	const getCurrent = () => {
		return stackRef.current[stackRef.current.length - 1] || "comisiones";
	};

	return (
		<NavigationContext.Provider value={{ push, pop, reset, getCurrent }}>
			{children}
		</NavigationContext.Provider>
	);
}

export function useNavigation() {
	return useContext(NavigationContext);
}
