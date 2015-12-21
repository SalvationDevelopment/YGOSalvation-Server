--Red-Eyes Spirit
function c12318.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_DESTROYED)
	e1:SetCondition(c12318.condition)	
	e1:SetTarget(c12318.target)
	e1:SetOperation(c12318.activate)
	c:RegisterEffect(e1)
	local e2=Effect.CreateEffect(c)
	e2:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e2:SetType(EFFECT_TYPE_ACTIVATE)
	e2:SetCode(EVENT_BATTLE_DESTROYED)
	e2:SetCondition(c12318.condition)	
	e2:SetTarget(c12318.target)
	e2:SetOperation(c12318.activate)
	c:RegisterEffect(e2)	
end
function c12318.cfilter(c,tp)
	return c:IsCode(74677422) or c:IsCode(88264978) or c:IsCode(96561011) or c:IsCode(5186893) or c:IsCode(55343236) or c:IsCode(67300516) and c:GetPreviousControler()==tp and c:IsFaceup()
end
function c12318.condition(e,tp,eg,ep,ev,re,r,rp)
	return eg:IsExists(c12318.cfilter,1,nil,tp)
end
function c12318.target(e,tp,eg,ep,ev,re,r,rp,chk)
	local tc=eg:GetFirst()
	if chk==0 then return Duel.GetLocationCount(tc:GetPreviousControler(),LOCATION_MZONE)>0 and eg:GetCount()==1
		and tc:IsLocation(LOCATION_GRAVE)
		and tc:IsCanBeSpecialSummoned(e,0,tp,true,true,tc:GetPreviousPosition(),tc:GetPreviousControler()) end
	tc:CreateEffectRelation(e)
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,eg,1,0,0)
end
function c12318.activate(e,tp,eg,ep,ev,re,r,rp)
	local tc=eg:GetFirst()
	if tc:IsRelateToEffect(e) then
		Duel.SpecialSummon(tc,0,tp,tc:GetPreviousControler(),true,true,tc:GetPreviousPosition())
	end
end
