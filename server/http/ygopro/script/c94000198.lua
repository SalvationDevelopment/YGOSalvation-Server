--Entermage Trapeze Magician
function c94000198.initial_effect(c)
    --xyz summon
	aux.AddXyzProcedure(c,aux.FilterBoolFunction(Card.IsRace,RACE_SPELLCASTER),4,2)
	c:EnableReviveLimit()
	--avoid damage
	local e1=Effect.CreateEffect(c)
	e1:SetProperty(EFFECT_FLAG_PLAYER_TARGET)
	e1:SetType(EFFECT_TYPE_FIELD)
	e1:SetCode(EFFECT_CHANGE_DAMAGE)
	e1:SetRange(LOCATION_MZONE)
	e1:SetTargetRange(1,0)
	e1:SetValue(c94000198.damval)
	c:RegisterEffect(e1)
	--atk twice
	local e2=Effect.CreateEffect(c)
	e2:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e2:SetType(EFFECT_TYPE_QUICK_O)
	e2:SetCode(EVENT_FREE_CHAIN)
	e2:SetRange(LOCATION_MZONE)
	e2:SetCountLimit(1)
	e2:SetCondition(c94000198.con)
	e2:SetCost(c94000198.cost)
	e2:SetTarget(c94000198.tg)
	e2:SetOperation(c94000198.op)
	c:RegisterEffect(e2)
	--spsummon
	local e3=Effect.CreateEffect(c)
	e3:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e3:SetProperty(EFFECT_FLAG_DAMAGE_STEP+EFFECT_FLAG_DELAY)
	e3:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_O)
	e3:SetCode(EVENT_DESTROYED)
	e3:SetCondition(c94000198.spcon)
	e3:SetTarget(c94000198.sptg)
	e3:SetOperation(c94000198.spop)
	c:RegisterEffect(e3)
end
function c94000198.damval(e,re,val,r,rp,rc)
	if bit.band(r,REASON_EFFECT+REASON_BATTLE)~=0 and val<=2500 then return 0
	else return val end
end
function c94000198.filter(c)
    return c:IsPosition(POS_FACEUP_ATTACK) and not c:IsHasEffect(EFFECT_EXTRA_ATTACK)
end
function c94000198.con(e,tp,eg,ep,ev,re,r,rp)
    return Duel.GetCurrentPhase()==PHASE_MAIN1
end
function c94000198.cost(e,tp,eg,ep,ev,re,r,rp,chk)
    if chk==0 then return e:GetHandler():CheckRemoveOverlayCard(tp,1,REASON_COST) end
	e:GetHandler():RemoveOverlayCard(tp,1,1,REASON_COST)
end
function c94000198.tg(e,tp,eg,ep,ev,re,r,rp,chk)
    if chk==0 then return Duel.IsExistingTarget(c94000198.filter,tp,LOCATION_MZONE,LOCATION_MZONE,1,e:GetHandler()) end 
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_FACEUP)
	local g=Duel.SelectTarget(tp,c94000198.filter,tp,LOCATION_MZONE,LOCATION_MZONE,1,1,e:GetHandler())
end
function c94000198.op(e,tp,eg,ep,ev,re,r,rp)
    local tc=Duel.GetFirstTarget()
	if tc:IsRelateToEffect(e) and tc:IsFaceup() and not tc:IsImmuneToEffect(e) then 
	    local e1=Effect.CreateEffect(e:GetHandler())
		e1:SetType(EFFECT_TYPE_SINGLE)
		e1:SetCode(EFFECT_EXTRA_ATTACK)
		e1:SetValue(1)
		e1:SetReset(RESET_PHASE+PHASE_END+RESET_EVENT+0x1fe0000)
		tc:RegisterEffect(e1)
        local e2=Effect.CreateEffect(e:GetHandler())
		e2:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_CONTINUOUS)
		e2:SetCode(EVENT_PHASE+PHASE_BATTLE)
		e2:SetCountLimit(1)
		e2:SetLabelObject(tc)
		e2:SetOperation(c94000198.desop)
		e2:SetReset(RESET_EVENT+0x1fe0000+RESET_PHASE+PHASE_BATTLE)
		Duel.RegisterEffect(e2,tp)
	end
end
function c94000198.desop(e,tp,eg,ep,ev,re,r,rp)
    local tc=e:GetLabelObject()
	if tc then Duel.Destroy(tc,REASON_EFFECT) end
end
function c94000198.spfilter(c,e,tp)
    return c:IsSetCard(0x24ba) and c:IsCanBeSpecialSummoned(e,0,tp,false,false)
end
function c94000198.spcon(e,tp,eg,ep,ev,re,r,rp)
    local c=e:GetHandler()
	return  c:IsLocation(LOCATION_GRAVE) and (c:IsReason(REASON_BATTLE) or (c:IsReason(REASON_EFFECT) and c:GetPreviousControler()==tp and rp~=tp))
end
function c94000198.sptg(e,tp,eg,ep,ev,re,r,rp,chk)
    if chk==0 then return Duel.IsExistingMatchingCard(c94000198.spfilter,tp,LOCATION_DECK,0,1,nil,e,tp) and Duel.GetLocationCount(tp,LOCATION_MZONE)>0 end 
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,nil,1,tp,LOCATION_DECK)
end
function c94000198.spop(e,tp,eg,ep,ev,re,r,rp)
    if Duel.GetLocationCount(tp,LOCATION_MZONE)<=0 then return false end
    Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
	local g=Duel.SelectMatchingCard(tp,c94000198.spfilter,tp,LOCATION_DECK,0,1,1,nil,e,tp)
	if g:GetCount()>0 then 
	    Duel.SpecialSummon(g,0,tp,tp,false,false,POS_FACEUP)
	end
end