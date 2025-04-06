import { useState, useEffect } from "react";
import { fetchUserAttributes } from "@aws-amplify/auth";
import { useAuthenticator } from "@aws-amplify/ui-react";

/**
 * Custom hook for fetching and managing user attributes
 * @returns {Object} Object containing user attributes and loading state
 */
export function useUserAttributes() {
  const { user } = useAuthenticator((context) => [context.user]);
  const [attributes, setAttributes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userAttributesReady, setUserAttributesReady] = useState(false);

  useEffect(() => {
    async function loadUserAttributes() {
      if (!user) {
        setAttributes(null);
        setLoading(false);
        setUserAttributesReady(false);
        return;
      }

      try {
        setLoading(true);
        setUserAttributesReady(false);
        const userAttributes = await fetchUserAttributes();
        setAttributes(userAttributes);
        setError(null);
        setUserAttributesReady(true);
      } catch (err) {
        console.error("Error fetching user attributes:", err);
        setError(err);
        setUserAttributesReady(false);
      } finally {
        setLoading(false);
      }
    }

    loadUserAttributes();
  }, [user]);

  const getUserFullName = () => {
    if (loading) return "Loading...";
    if (error || !attributes) return user?.username || "User";

    return attributes.name || attributes.email;
  };

  const getNameInitial = () => {
    const name = getUserFullName();
    return name && name !== "Loading..." && name !== "User"
      ? name.charAt(0).toUpperCase()
      : "U";
  };

  return {
    attributes,
    loading,
    error,
    userAttributesReady,
    getUserFullName,
    getNameInitial,
  };
}
