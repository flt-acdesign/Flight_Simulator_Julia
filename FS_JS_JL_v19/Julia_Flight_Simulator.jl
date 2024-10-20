
using HTTP, Sockets, CSV, DataFrames, LinearAlgebra, StaticArrays, JSON

# load general code and functions

include(raw"./SRC/JULIA/10_maths/quaternions.jl")   # quaternion functions
include(raw"./SRC/JULIA/20_physics/runge_kutta_integrator.jl") # Runge-Kutta integrator of equations of motion
include(raw"./SRC/JULIA/20_physics/initialization.jl") # General and model constants

include(raw"./SRC/JULIA/20_physics/six_DOF_equations_of_motion.jl") # 6 DOF equations of motion
include(raw"./SRC/JULIA/20_physics/handle_collisions.jl") # Detect ground and handle collisions

include(raw"./SRC/JULIA/30_HTTP/update_and_write_state.jl") # receive aircraft state, call RK4.5 and return state to javascript client
include(raw"./SRC/JULIA/30_HTTP/http_router_code.jl") # Launch program in Edge, start the server and write CSV with data at the end of simulation

