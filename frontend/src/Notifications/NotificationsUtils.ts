export const getUsers = async () => {
    
    // Get all users
    try {
        const response = await fetch(`api/get-users`, {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });
      
        if (!response.ok) {
          throw new Error(`Error fetching users: ${response.statusText}`);
        }
      
        const body = await response.json();
      
        const promises = body.result.map(async (user: any) => {
          try {
            const userRoleResponse = await fetch(`api/get-user-roles/${user[0]}`, {
              method: "GET",
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
              },
            });
      
            if (!userRoleResponse.ok) {
              throw new Error(`Error fetching user roles: ${userRoleResponse.statusText}`);
            }
      
            const userRoleResponseBody = await userRoleResponse.json();
            const role = userRoleResponseBody.result && userRoleResponseBody.result.join(",")
            user.role = role;
            const newUser = {
                id: user[0],
                university: user[1],
                createdAt: user[2],
                lastLogin: user[3],
                name: user[4],
                role: role,
            };
            return newUser;
          } catch (error) {
            console.error(`Error fetching user roles: ${error}`);
          }
        });
      
        const userDetails = await Promise.all(promises);
      
        console.log("User details:", userDetails);

        return userDetails;
      } catch (error) {
        console.error(`Error fetching users: ${error}`);
        
      }
  };