# This function is called by the Runge-Kutta integrator
function six_DOF_equations_of_motion(local_state, force_control_inputs, moment_control_inputs, constants::SimulationConstants)

    # Extract state variables from local_state
    x, y, z = local_state[1], local_state[2], local_state[3]     # Position in global axes
    vx, vy, vz = local_state[4], local_state[5], local_state[6]  # Velocity in global axes
    qx, qy, qz, qw = local_state[7], local_state[8], local_state[9], local_state[10]  # Orientation quaternion in global axes
    wx_body, wy_body, wz_body = local_state[11], local_state[12], local_state[13]  # Angular velocity in body axes

    # Normalize the orientation quaternion to remove numerical instabilities
    global_orientation_quaternion = quat_normalize([qw, qx, qy, qz])


    # ******* ➡ COMPUTE FORCES AND LINEAR ACCELERATIONS *******

    # Global velocity vector
    v_global = [vx, vy, vz]

    # Compute velocity in body axes
    v_body = rotate_vector_global_to_body(v_global, global_orientation_quaternion)

    v_body_mag = norm(v_body) + 1e-6  # Ensure non-zero magnitude to avoid division by zero

    dynamic_pressure = 0.5 * constants.air_density * v_body_mag^2

    # Compute angle of attack (alpha) and sideslip angle (beta) in degrees (Note that Julia does not have the function ATAN2, use rad2deg(angle(complex(1,1))) = 45, rad2deg(angle(complex(0,1))) = 90  )
    alpha = -1.0 * rad2deg(angle(complex( v_body[1], v_body[2])))  # DEGREES  +vx positive points aft, so change sign. +vz points down, so a positive angle of attack has a negative vx and a positive vz - Note these are body velocities with respect to the air
    beta = -1.0 * rad2deg(angle(complex( v_body[1], v_body[3])))   # +vy points starboard, so a positive beta angle has a negative vx and a positive vy - Note these are body velocities with respect to the air



    alpha_effective = alpha >= 0.0 ? max(15, alpha)  : min(-15, alpha) # Clip alpha and beta to represent stall
    beta_effective = beta >= 0.0 ? max(15, beta)  : min(-15, beta) 


    # Calculate thrust force based on thrust lever input
    if force_control_inputs.thrust_lever >= 0.0
        thrust_ratio = force_control_inputs.thrust_lever * constants.forward_thrust_ratio
    else
        thrust_ratio = force_control_inputs.thrust_lever * constants.reverse_thrust_ratio
    end
    thrust_force = thrust_ratio * constants.mass * 9.81  # X-axis points forwards

    # Define non-aerodynamic force (generally thrust) vector in body axes
    non_aerodynamic_force_body_vector = [thrust_force, force_control_inputs.x, force_control_inputs.y]

    # Rotate body forces to global axes
    non_aerodynamic_force_global = rotate_vector_body_to_global(non_aerodynamic_force_body_vector, global_orientation_quaternion)

    # Compute aerodynamic drag force in body frame
    F_drag_body = -(v_body / v_body_mag)

    # Compute aerodynamic lift, drag and sideslip force in body frame (if applicable)
    F_aero_body =   dynamic_pressure * constants.cross_sectional_area *  [
                        -1.0 * constants.drag_coefficient ,
                        alpha_effective * 0.01 , # alpha clipped at 15deg to simulate stall
                        0]  

    # Rotate aerodynamic forces back to global frame
    F_aero_global = rotate_vector_body_to_global(F_aero_body, global_orientation_quaternion)

    # Total force in global axes
    force_total = non_aerodynamic_force_global + F_aero_global

    # Compute linear acceleration in global axes
    ax = force_total[1] / constants.mass
    ay = force_total[2] / constants.mass + constants.gravity  # Add gravity in the Z-direction
    az = force_total[3] / constants.mass 

    # ******* ☢ COMPUTE MOMENTS AND ANGULAR ACCELERATIONS *******

    # Angular velocity in body frame
    w_body = [wx_body, wy_body, wz_body]

    # Angular velocity as a quaternion (ω_quat = [0, ωx, ωy, ωz] in body frame)
    omega_body_quaternion = [0.0, w_body[1], w_body[2], w_body[3]]

    # Compute orientation quaternion derivative (q_dot = 0.5 * q * ω_quat)
    q_dot = 0.5 * quat_multiply(global_orientation_quaternion, omega_body_quaternion)

    # Compute aircraft control moments in body axes
    control_moment_body_vector = constants.mean_aerodynamic_chord * constants.wing_area * dynamic_pressure .* [
        moment_control_inputs.aileron_input  * constants.c_roll_vs_aileron,
        moment_control_inputs.elevator_input * constants.c_pitch_vs_elevator,
        moment_control_inputs.rudder_input   * constants.c_yaw_vs_rudder
    ]

    # Compute aircraft static stability moments in body axes
    static_stability_moment_body_vector = constants.mean_aerodynamic_chord * constants.wing_area * dynamic_pressure .* [
                                0.0,  # roll 
                                0.0005 * beta_effective,  # yaw
                                -0.0005 * alpha_effective  # pitch
    ]


    # Compute aircraft damping moments in body axes
    aerodynamic_damping_moment_body_vector = constants.mean_aerodynamic_chord * constants.wing_area * dynamic_pressure .* [
                                -0.001 * wx_body,  # roll 
                                -0.001 * wy_body,  # yaw
                                -0.0005 * wz_body  # pitch
    ]



    # Compute angular drag torque (simplified aerodynamic damping model)
    M_drag_body = -constants.rotational_drag_coefficient * w_body

    # Total moment in body frame
    moment_total_body = control_moment_body_vector + M_drag_body + static_stability_moment_body_vector + aerodynamic_damping_moment_body_vector

    # Compute angular acceleration in body frame: α_body = I⁻¹ * (τ_total - ω × (I * ω))
    alpha_ang_body = inv(constants.I_body) * (moment_total_body - cross(w_body, constants.I_body * w_body))

    alpha_x, alpha_y, alpha_z = alpha_ang_body[1], alpha_ang_body[2], alpha_ang_body[3]

    # Extract quaternion derivatives
    q_dot_w, q_dot_x, q_dot_y, q_dot_z = q_dot[1], q_dot[2], q_dot[3], q_dot[4]




    # change of variable to make axis follow the convention in Flight Mechanics

    # Return derivative and additional outputs, including angular velocities in body frame
    return (
        [  # Local state derivatives
            vx, vy, vz,             # dx/dt, dy/dt, dz/dt (linear velocity in global frame)
            ax, ay, az,             # dvx/dt, dvy/dt, dvz/dt (linear acceleration in global frame)
            q_dot_x, q_dot_y, q_dot_z, q_dot_w,  # dq/dt components (orientation quaternion derivative)
            alpha_x, alpha_y, alpha_z  # dωx/dt, dωy/dt, dωz/dt (angular acceleration in body frame)
        ],
        [force_total[1], force_total[2], force_total[3]],  # Total force in global frame
        alpha,        # Angle of attack
        beta,         # Sideslip angle
        w_body[1], w_body[2], w_body[3]  # Angular velocity in body frame
    )
end
