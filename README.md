# transformation matrix

M = T( x, y, z ) * Ry(&beta;) * Rx(&alpha;) * Rz(&gamma;) * S( sx, sy ,sz )

# projection matrix

### parallel projection vs perspective

>in **parallel projection** each ray that cast points to the plane is parallel. 

>in **perspective projection** each ray that cast points to the plane, pass through a single point

### orthogonal projection 

projection rays are perpendicular to the plane of projection.\
the associated matrix is:\

| 2/(r-l) | 0 | 0 | -(r+l)/(r-l)|
|---|---|---|---|
| 0 | 2/(t-b) | 0 | -(t+b)/(t-b)|
| 0 | 0 | -2/(f-n) | -(f+n)/(f-n)|
| 0 | 0 | 0 | 1 |

where:
- l and e are the x coordinates in 3D space of that will be displayed on screen, on left and right border
- t and b are the y coordinates in 3D space of that will be displayed on screen, on top and bottom border
- n and f represent near and far on screen

the matrix itself is a composition of translation, scale and rotation to left handed.

to have correct proportions, the parameters are initialized to:

> - a = w/h;
> - l = -w;
> - r = w;
> - t = w/a;
> - b = -w/a;

### limitations

parallel projection does not change size of elements based on distance, instead we need to use perspective projection 

## perspective projection

| 2*n/(r-l) | 0 | (r+l)/(r-l)| 0 |
|---|---|---|---|
| 0 | 2*n/(t-b) | (t+b)/(t-b) | 0 |
| 0 | 0 | (f+n)/(n-f) | 2*f\*n/(n-f)|
| 0 | 0 | -1 | 0 |


like the projection matrix, we have some common values that depend on constraints. this values are: 


> - l = -a*n\*tn(&Theta;/2);
> - r = a*n\*tn(&Theta;/2);
> - t = -n*tn(&Theta;/2);
> - b = n*tn(&Theta;/2);
> where &Theta; is the angle of the fow

# view matrix

~~def~~:  the projection plane can be seen as a camera that that looks at the scene from the center of projection.

the view is defined as the inverse matrix that brings anything into a spot. V = T^(-1).

we have two friendly-ish way
of creating a camera:
- the fist approach is the **look-in-direction** matrix, where the matrix is positioned in the world with a translation, and then the camera is settled by a tuple of 3 elements (&alpha;, &beta;, &gamma;), where each angle is a rotation around, respectively (x,y,z). In particular (0, &beta; &gamma;) watches to **North**, while (90, &beta; &gamma;) watches to **West**.

at the end, we could say that the view matrix V can be computed with the following transformations: 

> V = Rz(-&gamma;) * Ry(-&beta;) * Rx(-&alpha;) * T(- x, -y, -z )

- the second approach is the **look-at** model, where the view is positioned with another translation, that we call **c**, and then it is settled using a point to watch at, that we will call **a**, and a point that represents the top-left point on the screen, that we will call **u**. u is usually settled to (0,1,0).
to calculate the actual matrix, we need to calculate different vector:
- vz = (c-a)/|c-a|
- vx = (u x vz)/|u x vz|
- vy = vz x vx

the matrix (that needs to be inverted) is: 

| vx |  vy | vz | c  |
| --- |  --- | --- | ---  |
| 0 |  0 | 0 | 1  |

where vx,vy,vz = Rc\
the final matrix would be something like:
| Rc^T | - c * Rc^T  |
| --- |  --- |
| 0  | 1  |

# how to transform objects 

the normal way to transform coordinates of 3D objects into 2D drawable objects involves 5 steps:

1. World transformation
1. View transformation
1. Projection
1. Normalization
1. Screen transform

So, the correct sequence of doing products is:

Projection * View * World * coordinates




