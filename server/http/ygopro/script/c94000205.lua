--Sea Dragoons of Draconia
function c94000205.initial_effect(c)
    --pendulum summon
	aux.AddPendulumProcedure(c)
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	c:RegisterEffect(e1)
	--spsummon
	local e2=Effect.CreateEffect(c)
	e2:SetCategory(CATEGORY_SPECIA_SUMMON)
	e2:SetProperty(EFFECT_FLAG_DAMAGE_STEP)
	e2:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_TRIGGER_O)
	e2:SetCode(EVENT_BATTLE_DESTROYED)
	e2:SetRange(LOCATION_PZONE)
	e2:SetCountLimit(1,94000205)
	e2:SetTarget(c94000205.tg)
	e2:SetOperation(c94000205.op)
	c:RegisterEffect(e2)
end
function c94000205.spfilter(c,e,tp)
    return c:IsType(TYPE_NORMAL) and c:IsType(TYPE_MONSTER) and c:IsCanBeSpecialSummoned(e,0,tp,false,false)
end
function c94000205.tg(e,tp,eg,ep,ev,re,r,rp,chk)
    if chk==0 then return Duel.IsExistingMatchingCard(c94000205.spfilter,tp,LOCATION_HAND,0,1,nil,e,tp) 
	    and Duel.GetLocationCount(tp,LOCATION_MZONE)>0 end 
	Duel.SetOperationInfo(0,CATEGORY_SPECIA_SUMMON,nil,1,tp,LOCATION_HAND)
end
function c94000205.op(e,tp,eg,ep,ev,re,r,rp)
    if Duel.GetLocationCount(tp,LOCATION_MZONE)<=0 or not e:GetHandler():IsRelateToEffect(e) then return false end
    Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
	local g=Duel.SelectMatchingCard(tp,c94000205.spsummon,tp,LOCATION_HAND,0,1,1,nil,e,tp)
	if g:GetCount()>0 then 
        Duel.SpecialSummon(g,0,tp,tp,false,false,POS_FACEUP)	
	end
end