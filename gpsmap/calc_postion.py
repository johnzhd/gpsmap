import utm
import math


baidu_ak = 'fw7E1VZEWgzB6yKaDu3t4WhgWCrAkG4G'

global_EP = 50
global_status = ['Err', 'far','outside','inside','cross','include']



class utm_point():
    def __init__(self, x = 0.0, y = 0.0, zone = 0, mark = '', r = 0.0):
        self.x = x
        self.y = y
        self.zone = zone
        self.mark = mark
        self.r = r
    def __str__(self):
        return "(x:{0}, y:{1}, zone:{2}, mark:{3}, distance:{4})".format(self.x, self.y, self.zone, self.mark, self.r)
    def is_same_zone(self, dst):
        return self.zone == dst.zone and self.mark == dst.mark

def sqr(a):
    return a * a

def distance(a, b):
    width = a.x - b.x if a.x > b.x else b.x -a.x
    length = a.y - b.y if a.y > b.y else b.y -a.y
    return math.sqrt(sqr(width) + sqr(length))


def calc_cross_point(A, B, EP = global_EP):
    d = distance(A, B);
    if A.r + B.r + EP < d:
        return 1, None, None
    elif d < EP:
        return 5, None, None
    
    ia = utm_point(zone=A.zone, mark = A.mark, r=EP)
    ib = utm_point(zone=A.zone, mark = A.mark, r=EP)

    sqr_k = sqr(A.r)
    a = B.x - A.x
    sqr_a = sqr(a)
    b = B.y - A.y
    sqr_b = sqr(b)

    d = sqr(B.r) - sqr_k - sqr_a - sqr_b

    aa = 4 * sqr_a + 4 * sqr_b;
    bb = 4 * b * d;
    cc = sqr(d) - 4 * sqr_a * sqr_k;

    drt = sqr(bb) - 4 * aa * cc
    if drt < 0:
        return 5, None, None
    drt = math.sqrt (drt);
    ia.y = (-bb + drt) / 2 / aa
    ib.y = (-bb - drt) / 2 / aa
    if math.fabs(a) < EP:
        ia.x = math.sqrt (sqr_k - sqr (ia.y))
        ib.x = -ia.x
    else:
        ia.x = (2 * b * ia.y + d) / -2 / a
        ib.x = (2 * b * ib.y + d) / -2 / a
    ia.x += A.x;
    ia.y += A.y;
    ib.x += A.x;
    ib.y += A.y;
    if math.fabs (ia.y - ib.y) < EP:
        if abs (A.r + B.r - dd) < EP:
            return 2, ia, ib
        if abs (dd - (max (A.r, B.r) - min (A.r, B.r))) < EP:
            return 3, ia, ib
    return 4, ia, ib


def calc_distance_utm(u1,u2,u3, EP):
    s, p1, p2 = calc_cross_point(u1, u2)
    if not p1 or not p2:
        return None
    p1.r = EP
    p2.r = EP

    pr = None
    if s == 2 or s == 3:
        d1 = distance(p1, u3)
        if math.fabs(d1 -u3.r) < EP:
            pr = p1
    elif s == 4:
        d1 = distance(p1, u3)
        d2 = distance(p2, u3)
        b1 = u3.r - EP < d1 and d1 < u3.r + EP
        b2 = u3.r - EP < d2 and d2 < u3.r + EP
        if not b1 and not b2:
            pr = None
        elif not b1 and b2:
            pr = p2
        elif b1 and not b2:
            pr = p1
        else : # b1 and b2
            d1 = math.fabs(d1 - u3.r)
            d2 = math.fabs(d2 - u3.r)
            pr = p1 if d1 < d2 else p2
    if pr:
        return pr
    return None


def calc( latitude1, longitude1, r1,
              latitude2, longitude2, r2,
              latitude3, longitude3, r3, EP = global_EP):
    try:
        u1 = utm_point( *utm.from_latlon(latitude1,longitude1), r=r1)
        u2 = utm_point( *utm.from_latlon(latitude2,longitude2), r=r2)
        u3 = utm_point( *utm.from_latlon(latitude3,longitude3), r=r3)
    except Exception as e:
        return None

    pr = calc_distance_utm(u1,u2,u3, EP)
    if pr:
        latitude, longitude = utm.to_latlon(pr.x, pr.y, pr.zone, pr.mark)
        return latitude, longitude, pr.r
    return None


def calc_list_core( l_points, EP, func_fretch ):
    npos1 = 0
    npos2 = 0
    npos3 = 0
    list_count = len(l_points)

    ret_list = {}
    ret_list[3]=[]
    ret_list[5]=[]

    while npos1 < list_count - 2:
        try:
            la1, lo1, dis1 = func_fretch(l_points[npos1])
            npos1 = npos1 + 1
            if not la1 or not lo1 or not dis1:
                continue
            u1 = utm_point( *utm.from_latlon(la1,lo1), r=dis1)
        except Exception as e:
            continue

        npos2 = npos1
        while npos2 < list_count - 1:
            try:
                la2, lo2, dis2 = func_fretch(l_points[npos2])
                npos2 = npos2 + 1
                if not la2 or not lo2 or not dis2:
                    continue
                u2 = utm_point( *utm.from_latlon(la2,lo2), r=dis2)
            except Exception as e:
                continue

            s, p1, p2 = calc_cross_point(u1, u2)
            if not p1 or not p2:
                continue
            p1.r = EP
            p2.r = EP


            npos3 = npos2
            while npos3 < list_count:
                try:
                    la3, lo3, dis3 = func_fretch(l_points[npos3])
                    npos3 = npos3 + 1
                    if not la3 or not lo3 or not dis3:
                        continue
                    u3 = utm_point( *utm.from_latlon(la3,lo3), r=dis3)
                except Exception as e:
                    continue
                
                ret = calc_list_core_cross_point(s, p1, p2, u3, EP)
                if ret:
                    return ret
                '''
                ret,level = calc_list_core_cover_zone(s, p1, p2, u3)
                if ret:
                    if level == 1:
                        return ret
                    ret_list[level].append(ret)
    if len(ret_list[3]) > 0:
        return ret_list[3][0]
    if len(ret_list[5]) > 0:
        return ret_list[5][0]
    '''
    return None


def calc_list_core_cross_point(s, p1, p2, u3, EP):
    if s == 2 or s == 3:
        d1 = distance(p1, u3)
        if math.fabs(d1 - u3.r) < EP:
            return p1
    elif s == 4:
        d1 = distance(p1, u3)
        d2 = distance(p2, u3)
        b1 = u3.r - EP < d1 and d1 < u3.r + EP
        b2 = u3.r - EP < d2 and d2 < u3.r + EP
        if not b1 and not b2:
            return None
        elif not b1 and b2:
            return p2
        elif b1 and not b2:
            return p1
        else:
            d1 = math.fabs(d1 - u3.r)
            d2 = math.fabs(d2 - u3.r)
            return p1 if d1 < d2 else p2
    return None

def calc_list_core_cover_zone(s, p1, p2, u3):
    if s in [2,3]:
        d1 = distance(p1,u3)
        if d1 < u3.r:
            p1.r = u3.r - d1
            if p1.r > d1:
                p1.r = d1
            return p1, 5
    elif s == 4:
        d1 = distance(p1, u3)
        d2 = distance(p2, u3)
        b1 = u3.r < d1 and d1 < u3.r
        b2 = u3.r < d2 and d2 < u3.r
        if True not in [b1, b2]:
            return None, None
        elif not b1 and b2:
            return calc_point_then_middle(u3, p2, d2), 1
        elif b1 and not b2:
            return calc_point_then_middle(u3, p1, d1), 1
        else:
            return calc_middle_then_point(u3, p1, d1, p2, d2), 3
    return None

def calc_point_then_middle(u3, p, d):
    ret = utm_point(zone=p.zone, mark = p.mark, r=(u3.r - d)/2 )
    rate = d + ret.r / d
    ret.x = (p.x - u3.x) * rate
    ret.y = (p.y - u3.y) * rate
    return ret

def calc_middle_then_point(u3, p1,d1, p2,d2):
    ret = calc_middle_point(p1, p2)
    d1 = distance(u3, ret)
    d2 = u3.r - d1
    if d2 > d1:
        d2 = d1
    if ret.r > d2:
        ret.r = d2
    return ret

def calc_middle_point(p1, p2):
    d1 = distance(p1, p2)
    ret = utm_point(zone=p.zone, mark = p.mark, r=d1/2 )
    ret.x = (p1.x + p2.x)/2
    ret.y = (p1.y + p2.y)/2
    return ret

def calc_list_precheck(l_points, func_fretch):
    ret = {}
    if len(l_points) < 3:
        return False
    for o in l_points:
        la, lo, _ = func_fretch(o)
        if la and lo:
            ret[(la,lo)] = True
    if len(ret) < 3:
        return False
    return True

def calc_list( l_points, EP, func_fretch ):
    if not calc_list_precheck(l_points, func_fretch):
        return None
    pr = calc_list_core(l_points, EP, func_fretch)
    if pr:
        latitude, longitude = utm.to_latlon(pr.x, pr.y, pr.zone, pr.mark)
        return latitude, longitude, pr.r
    return None



