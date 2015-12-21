--Entermage Flame Eater
function c94000203.initial_effect(c)
    --spsummon
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e1:SetProperty(EFFECT_FLAG_DAMAGE_STEP)
	e1:SetType(EFFECT_TYPE_QUICK_O)
	e1:SetCode(EVENT_CHAINING)
	e1:SetRange(LOCATION_HAND)
	e1:SetCondition(c94000203.spcon)
	e1:SetCost(c94000203.spcost)
	e1:SetTarget(c94000203.sptg)
	e1:SetOperation(c94000203.spop)
	c:RegisterEffect(e1)
	--damage
	local e2=Effect.CreateEffect(c)
	e2:SetCategory(CATEGORY_DAMAGE)
	e2:SetProperty(EFFECT_FLAG_PLAYER_TARGET)
	e2:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_F)
	e2:SetCode(EVENT_SUMMON_SUCCESS)
	e2:SetTarget(c94000203.tg)
	e2:SetOperation(c94000203.op)
	c:RegisterEffect(e2)
	local e3=e2:Clone()
	e3:SetCode(EVENT_SPSUMMON_SUCCESS)
	c:RegisterEffect(e3)
end
function c94000203.spcon(e,tp,eg,ep,ev,re,r,rp)
    return Duel.GetOperationInfo(ev,CATEGORY_DAMAGE)
end
function c94000203.spcost(e,tp,eg,ep,ev,re,r,rp,chk)
    if chk==0 then return true end 
	local c=e:GetHandler()
	local e1=Effect.CreateEffect(c)
	e1:SetProperty(EFFECT_FLAG_PLAYER_TARGET)
	e1:SetType(EFFECT_TYPE_FIELD)
	e1:SetCode(EFFECT_CANNOT_SPECIAL_SUMMON)
	e1:SetTargetRange(1,0)
	e1:SetTarget(c94000203.splimit)
	e1:SetReset(RESET_PHASE+PHASE_END)
	Duel.RegisterEffect(e1,tp)
end
function c94000203.splimit(e,c,sump,sumtype,sumpos,targetp,se)
    return not c:IsSetCard(0x24ba)
end
function c94000203.sptg(e,tp,eg,ep,ev,re,r,rp,chk)
    if chk==0 then return Duel.GetLocationCount(tp,LOCATION_MZONE)>0 and e:GetHandler():IsCanBeSpecialSummoned(e,0,tp,false,false) end 
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,e:GetHandler(),1,tp,LOCATION_HAND)
end
function c94000203.spop(e,tp,eg,ep,ev,re,r,rp)
    if Duel.GetLocationCount(tp,LOCATION_MZONE)<=0 then return false end 
	local c=e:GetHandler()
	if c:IsRelateToEffect(e) then 
	    Duel.SpecialSummon(c,0,tp,tp,false,false,POS_FACEUP)
		local e1=Effect.CreateEffect(c)
		e1:SetProperty(EFFECT_CANNOT_DISABLE)
		e1:SetType(EFFECT_TYPE_SINGLE)
		e1:SetCode(EFFECT_LEAVE_FIELD_REDIRECT)
		e1:SetValue(LOCATION_REMOVED)
		e1:SetReset(RESET_EVENT+0x1fe0000)
		c:RegisterEffect(e1)		
		local e2=Effect.CreateEffect(c)
	    e2:SetProperty(EFFECT_FLAG_PLAYER_TARGET)
	    e2:SetType(EFFECT_TYPE_FIELD)
	    e2:SetCode(EFFECT_CHANGE_DAMAGE)
	    e2:SetTargetRange(1,0)
		e2:SetReset(RESET_CHAIN)
		e2:SetLabelObject(re)
	    e2:SetValue(c94000203.damval)
	    Duel.RegisterEffect(e2,tp)
	end
end
function c94000203.damval(e,re,val,r,rp,rc)
	if bit.band(r,REASON_EFFECT)~=0 and re==e:GetLabelObject() then 
	    return 0
	else 
	    return val 
	end
end
function c94000203.tg(e,tp,eg,ep,ev,re,r,rp,chk)
    if chk==0 then return true end 
	Duel.SetTargetParam(500)
	Duel.SetOperationInfo(0,CATEGORY_DAMAGE,nil,0,PLAYER_ALL,500)
end
function c94000203.op(e,tp,eg,ep,ev,re,r,rp)
    Duel.Damage(tp,500,REASON_EFFECT)
	Duel.Damage(1-tp,500,REASON_EFFECT)
end