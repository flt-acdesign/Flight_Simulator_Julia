
############## Quaternion Algebra ##############



# Quaternion functions without type annotations
function quat_normalize(q)
    return q / norm(q)
end

function quat_conjugate(q)
    return [q[1], -q[2], -q[3], -q[4]]
end

function quat_multiply(q1, q2)
    qw1, qx1, qy1, qz1 = q1
    qw2, qx2, qy2, qz2 = q2
    qw = qw1 * qw2 - qx1 * qx2 - qy1 * qy2 - qz1 * qz2
    qx = qw1 * qx2 + qx1 * qw2 + qy1 * qz2 - qz1 * qy2
    qy = qw1 * qy2 - qx1 * qz2 + qy1 * qw2 + qz1 * qx2
    qz = qw1 * qz2 + qx1 * qy2 - qy1 * qx2 + qz1 * qw2
    return [qw, qx, qy, qz]
end

function rotate_vector_by_quaternion(vec, quat)
    # Ensure the quaternion is normalized
    quat = quat_normalize(quat)

    # Extract scalar and vector parts
    qw = quat[1]
    qv = quat[2:4]

    # Compute the rotated vector
    t = 2.0 * cross(qv, vec)
    rotated_vec = vec + qw * t + cross(qv, t)
    return rotated_vec
end


    # Rotation functions without axis inversions
    function rotate_vector_body_to_global(vec_body, quaternion)
        vec_global = rotate_vector_by_quaternion(vec_body, quaternion)
        return vec_global
    end

    function rotate_vector_global_to_body(vec_global, quaternion)
        vec_body = rotate_vector_by_quaternion(vec_global, quat_conjugate(quaternion))
        return vec_body
    end
