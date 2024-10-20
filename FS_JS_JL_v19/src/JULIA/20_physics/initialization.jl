# Define the SimulationConstants struct with a general 3x3 inertia tensor
struct SimulationConstants
    mass::Float64
    gravity::Float64
    air_density::Float64
    cross_sectional_area::Float64
    wing_area::Float64
    mean_aerodynamic_chord::Float64
    wingspan::Float64
    drag_coefficient_zero::Float64
    drag_coefficient_alpha::Float64
    drag_coefficient_alpha2::Float64
    drag_coefficient_beta2::Float64
    lift_coefficient_zero::Float64
    lift_coefficient_alpha::Float64
    side_force_coefficient_beta::Float64
    pitching_moment_coefficient_zero::Float64
    pitching_moment_coefficient_alpha::Float64
    pitching_moment_coefficient_q::Float64
    yawing_moment_coefficient_beta::Float64
    yawing_moment_coefficient_r::Float64
    rolling_moment_coefficient_beta::Float64
    rolling_moment_coefficient_p::Float64
    rotational_drag_coefficient::Float64
    drag_coefficient::Float64
    forward_thrust_ratio::Float64
    reverse_thrust_ratio::Float64
    I_body::Matrix{Float64} # Updated to be a general 3x3 matrix
    c_roll_vs_aileron::Float64
    c_pitch_vs_elevator::Float64
    c_yaw_vs_rudder::Float64
end

# Create an instance using positional arguments including general inertia tensor
const sim_constants = SimulationConstants(
    1.0,        # mass
    0.0,# -9.81,      # gravity
    1.225,      # air_density
    0.1,        # cross_sectional_area
    0.2,        # wing_area
    0.5,        # mean_aerodynamic_chord
    1.0,        # wingspan
    0.02,       # drag_coefficient_zero
    0.0,        # drag_coefficient_alpha
    0.0001,     # drag_coefficient_alpha2
    0.0001,     # drag_coefficient_beta2
    0.0,        # lift_coefficient_zero
    0.1,        # lift_coefficient_alpha
    0.01,       # side_force_coefficient_beta
    0.0,        # pitching_moment_coefficient_zero
    -0.05,      # pitching_moment_coefficient_alpha
    -0.02,      # pitching_moment_coefficient_q
    -0.01,      # yawing_moment_coefficient_beta
    -0.005,     # yawing_moment_coefficient_r
    -0.01,      # rolling_moment_coefficient_beta
    -0.005,     # rolling_moment_coefficient_p
    0.1,        # rotational_drag_coefficient
    1.05,       # DRAG_COEFFICIENT
    .2,        # forward_thrust_ratio
    0.05,        # reverse_thrust_ratio
    [1/6 0.0 0.0; 0.0 1/6 0.0; 0.0 0.0 1/6], # General 3x3 inertia tensor for a cube of size 1, mass 1kg
    0.01, # c_roll_vs_aileron, rolling moment in body axis is given by aileron_input * dynamic_pressure * c_roll_vs_aileron * MAC * S_Ref
    0.1, # c_pitch_vs_elevator, rolling moment in body axis is given by aileron_input * dynamic_pressure * c_pitch_vs_elevator * MAC * S_Ref
    0.1  # c_yaw_vs_rudder, rolling moment in body axis is given by aileron_input * dynamic_pressure * c_yaw_vs_rudder * MAC * S_Ref

)
