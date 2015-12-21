--Odd-Eyes Rebellion Dragon
function c94000201.initial_effect(c)
    --Xyz symmon and Pendulum Summon
	aux.AddPendulumProcedure(c)
	c:EnableReviveLimit()
	local e1=Effect.CreateEffect(c)
	e1:SetDescription(aux.Stringid(94000201,0))
	e1:SetProperty(EFFECT_FLAG_UNCOPYABLE)
	e1:SetType(EFFECT_TYPE_FIELD)
	e1:SetCode(EFFECT_SPSUMMON_PROC)
	e1:SetRange(LOCATION_EXTRA)
	e1:SetValue(SUMMON_TYPE_XYZ)
	e1:SetCondition(c94000201.xyzcon1)
	e1:SetOperation(c94000201.xyzop1)
	c:RegisterEffect(e1)
	---
	local e2=Effect.CreateEffect(c)
	e2:SetDescription(aux.Stringid(94000201,1))
	e2:SetProperty(EFFECT_FLAG_UNCOPYABLE)
	e2:SetType(EFFECT_TYPE_FIELD)
	e2:SetCode(EFFECT_SPSUMMON_PROC)
	e2:SetRange(LOCATION_EXTRA)
	e2:SetValue(SUMMON_TYPE_XYZ)
	e2:SetCondition(c94000201.xyzcon2)
	e2:SetOperation(c94000201.xyzop2)
	c:RegisterEffect(e2)
	--destroy
	local e3=Effect.CreateEffect(c)
	e3:SetCategory(CATEGORY_DESTROY+CATEGORY_DAMAGE)
	e3:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_F)
	e3:SetCode(EVENT_SPSUMMON_SUCCESS)
	e3:SetCondition(c94000201.descon)
	e3:SetTarget(c94000201.destg)
	e3:SetOperation(c94000201.desop)
	c:RegisterEffect(e3)
	--extra atk
	local e4=Effect.CreateEffect(c)
	e4:SetType(EFFECT_TYPE_IGNITION)
	e4:SetRange(LOCATION_MZONE)
	e4:SetCountLimit(1)
	e4:SetCondition(c94000201.extracon)
	e4:SetCost(c94000201.extracost)
	e4:SetOperation(c94000201.extraop)
	c:RegisterEffect(e4)
	--to pzone
	local e5=Effect.CreateEffect(c)
	e5:SetProperty(EFFECT_FLAG_DAMAGE_STEP+EFFECT_FLAG_DELAY)
	e5:SetCategory(CATEGORY_DESTROY)
	e5:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_O)
	e5:SetCode(EVENT_LEAVE_FIELD)
	e5:SetCondition(c94000201.con)
	e5:SetOperation(c94000201.op)
	c:RegisterEffect(e5)
	--extra attack count
	if not c94000201.global_check then 
	    c94000201.global_check=true
        c94000201[0]=0		
		c94000201[1]=0
		local ge1=Effect.CreateEffect(c)
		ge1:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_CONTINUOUS)
		ge1:SetCode(EVENT_DESTROYED)
		ge1:SetOperation(c94000201.checkop1)
		Duel.RegisterEffect(ge1,0)
		local ge2=Effect.CreateEffect(c)
		ge2:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_CONTINUOUS)
		ge2:SetCode(EVENT_PHASE+PHASE_END)
		ge2:SetCountLimit(1)
		ge2:SetOperation(c94000201.checkop2)
		Duel.RegisterEffect(ge2,0)
	end
	--place pcard
	local e9=Effect.CreateEffect(c)
	e9:SetType(EFFECT_TYPE_IGNITION)
	e9:SetRange(LOCATION_PZONE)
	e9:SetCountLimit(1)
	e9:SetCondition(c94000201.pcon)
	e9:SetTarget(c94000201.ptg)
	e9:SetOperation(c94000201.pop)
	c:RegisterEffect(e9)
end
function c94000201.xyzfilter(c)
    return c:IsRace(RACE_DRAGON) and c:GetLevel()==7
end
function c94000201.xyzcon1(e,c,og)
    if c==nil then return true end 
	local tp=c:GetControler()
	local g=Duel.GetMatchingGroup(Card.IsFaceup,tp,LOCATION_MZONE,0,nil)
	return g:IsExists(c94000201.xyzfilter,2,nil) and Duel.GetLocationCount(tp,LOCATION_MZONE)>-1
end
function c94000201.xyzop1(e,tp,eg,ep,ev,re,r,rp,c,og)
    Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_XMATERIAL)
	local g1=Duel.SelectMatchingCard(tp,c94000201.xyzfilter,tp,LOCATION_MZONE,0,2,2,nil,c)
	Duel.Overlay(c,g1)
	c:SetMaterial(g1)
end
function c94000201.xyzfilter1(c)
    return c:IsRace(RACE_DRAGON) and c:IsFaceup() and c:GetLevel()==7
end
function c94000201.xyzfilter2(c)
    return c:IsType(TYPE_XYZ) and c:IsFaceup()
end
function c94000201.xyzcon2(e,c,og)
    if c==nil then return true end 
	local tp=c:GetControler()
	local g=Duel.GetMatchingGroup(Card.IsFaceup,tp,LOCATION_MZONE,0,nil)
	return g:IsExists(c94000201.xyzfilter1,1,nil) and g:IsExists(c94000201.xyzfilter2,1,nil) and Duel.GetLocationCount(tp,LOCATION_MZONE)>-1
end
function c94000201.xyzop2(e,tp,eg,ep,ev,re,r,rp,c,og)
    Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_XMATERIAL)
	local g1=Duel.SelectMatchingCard(tp,c94000201.xyzfilter1,tp,LOCATION_MZONE,0,1,1,nil,c)
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_XMATERIAL)
	local g2=Duel.SelectMatchingCard(tp,c94000201.xyzfilter2,tp,LOCATION_MZONE,0,1,1,nil,c)
	if g2 then 
	    local og=g2:GetFirst():GetOverlayGroup()
	    Duel.SendtoGrave(og,REASON_RULE)
	end
	g1:Merge(g2)
	Duel.Overlay(c,g1)
	c:SetMaterial(g1)
end
function c94000201.desfilfer(c)
    return c:IsFaceup() and c:IsLevelBelow(7) and c:IsDestructable()
end
function c94000201.descon(e,tp,eg,ep,ev,re,r,rp)
    return e:GetHandler():GetMaterial():IsExists(Card.IsType,1,nil,TYPE_XYZ)
end
function c94000201.destg(e,tp,eg,ep,ev,re,r,rp,chk)
    if chk==0 then return true end 
	Duel.SetOperationInfo(0,CATEGORY_DESTROY,nil,1,0,0)
end
function c94000201.desop(e,tp,eg,ep,ev,re,r,rp)
    local g=Duel.GetMatchingGroup(c94000201.desfilfer,tp,0,LOCATION_MZONE,nil)
	if g:GetCount()>0 then 
		local des=Duel.GetMatchingGroup(c94000201.desfilfer,tp,0,LOCATION_MZONE,nil)
		Duel.Destroy(des,REASON_EFFECT)
		if des:GetCount()~=0 then 
		    local dam=0
			local og=Duel.GetOperatedGroup()
			local tc=og:GetFirst()
			while tc do 
			    if tc:GetAttack()>dam then dam=tc:GetAttack() end
				tc=og:GetNext()
			end
			if dam>0 then Duel.Damage(1-tp,dam,REASON_EFFECT) end
		end	
	end
end
function c94000201.checkop1(e,tp,eg,ep,ev,re,r,rp)
    local tc=eg:GetFirst()
	while tc do
		if tc:IsType(TYPE_MONSTER) or tc:IsType(TYPE_TOKEN) then 
		    c94000201[tc:GetControler()]=c94000201[tc:GetControler()]+1 
		end
		tc=eg:GetNext()
	end
end
function c94000201.checkop2(e,tp,eg,ep,ev,re,r,rp)
    c94000201[0]=0
	c94000201[1]=0
end
function c94000201.extracon(e,tp,eg,ep,ev,re,r,rp)
    return c94000201[1-e:GetHandlerPlayer()]>0 
end
function c94000201.atkval(e,tp,eg,ep,ev,re,r,rp)
    local extra=e:GetLabel()
	return extra-1
end
function c94000201.extracost(e,tp,eg,ep,ev,re,r,rp,chk)
    if chk==0 then return e:GetHandler():CheckRemoveOverlayCard(tp,1,REASON_COST) end 
	e:GetHandler():RemoveOverlayCard(tp,1,1,REASON_COST)
	local extra=c94000201[1-e:GetHandlerPlayer()]
	e:SetLabel(extra)
end
function c94000201.extraop(e,tp,eg,ep,ev,re,r,rp)
    local c=e:GetHandler()
	if c:IsFaceup() and c:IsRelateToEffect(e) then 
	    local e1=Effect.CreateEffect(c)
		e1:SetType(EFFECT_TYPE_SINGLE)
		e1:SetCode(EFFECT_EXTRA_ATTACK)
		e1:SetLabel(e:GetLabel())
		e1:SetValue(c94000201.atkval)
		e1:SetReset(RESET_PHASE+PHASE_END+RESET_EVENT+0x1fe0000)
		c:RegisterEffect(e1)
	end
end
function c94000201.penfilter1(c)
    return c:IsDestructable() and c:GetSequence()==6
end
function c94000201.penfilter2(c)
    return c:IsDestructable() and c:GetSequence()==7
end
function c94000201.con(e,tp,eg,ep,ev,re,r,rp)
    local p1=Duel.GetFieldCard(tp,LOCATION_SZONE,6)
	local p2=Duel.GetFieldCard(tp,LOCATION_SZONE,7)
    if not p1 and not p2 then return false end 
    return (p1 and p1:IsDestructable()) or (p2 and p2:IsDestructable()) and e:GetHandler():GetPreviousLocation()==LOCATION_MZONE
end
function c94000201.op(e,tp,eg,ep,ev,re,r,rp)
    local p1=Duel.GetFieldCard(tp,LOCATION_SZONE,6)
	local p2=Duel.GetFieldCard(tp,LOCATION_SZONE,7)
	local g1=nil
	local g2=nil
	if p1 then 
	    g1=Duel.GetMatchingGroup(c94000201.penfilter1,tp,LOCATION_SZONE,0,nil)
	end
	if p2 then 
	    g2=Duel.GetMatchingGroup(c94000201.penfilter2,tp,LOCATION_SZONE,0,nil)
		if g1 then 
		    g1:Merge(g2)
		else 
		    g1=g2
		end
	end
	if g1 and Duel.Destroy(g1,REASON_EFFECT)~=0 then 
	        local c=e:GetHandler()	
	        Duel.MoveToField(c,tp,tp,LOCATION_SZONE,POS_FACEUP,true)
	end 
end
function c94000201.pfilter(c)
    return c:IsType(TYPE_PENDULUM)
end
function c94000201.pcon(e,tp,eg,ep,ev,re,r,rp)
    local seq=e:GetHandler():GetSequence()
	return Duel.GetFieldCard(tp,LOCATION_SZONE,13-seq)==nil 
end
function c94000201.ptg(e,tp,eg,ep,ev,re,r,rp,chk)
    if chk==0 then return Duel.IsExistingMatchingCard(c94000201.pfilter,tp,LOCATION_DECK,0,1,nil) end
end
function c94000201.pop(e,tp,eg,ep,ev,re,r,rp)
    Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_TOFIELD)
	local g=Duel.SelectMatchingCard(tp,c94000201.pfilter,tp,LOCATION_DECK,0,1,1,nil)
	if g:GetCount()>0 then 
	    local tc=g:GetFirst()
		Duel.MoveToField(tc,tp,tp,LOCATION_SZONE,POS_FACEUP,true)
	end
end