--Cursed Ivy
function c11111138.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetHintTiming(0,TIMING_END_PHASE)
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e1:SetTarget(c11111138.target)
	e1:SetOperation(c11111138.operation)
	c:RegisterEffect(e1)
	--Destroy
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_CONTINUOUS+EFFECT_TYPE_SINGLE)
	e2:SetCode(EVENT_LEAVE_FIELD)
	e2:SetOperation(c11111138.desop)
	c:RegisterEffect(e2)
	--tokens
	local e3=Effect.CreateEffect(c)
	e3:SetDescription(aux.Stringid(11111138,0))
	e3:SetCategory(CATEGORY_DAMAGE)
	e3:SetProperty(EFFECT_FLAG_PLAYER_TARGET)
	e3:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_F)
	e3:SetCode(EVENT_TO_GRAVE)
	e3:SetCondition(c11111138.condition)
	e3:SetTarget(c11111138.target2)
	e3:SetOperation(c11111138.activate2)
	c:RegisterEffect(e3)
end
function c11111138.filter(c,e,tp)
	return c:IsCode(11111139) and c:IsCanBeSpecialSummoned(e,0,tp,false,false)
end
function c11111138.target(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:GetLocation()==LOCATION_GRAVE and chkc:GetControler()==tp
		and chkc:IsCanBeSpecialSummoned(e,0,tp,false,false) end
	if chk==0 then return Duel.GetLocationCount(tp,LOCATION_MZONE)>0
		and Duel.IsExistingTarget(c11111138.filter,tp,LOCATION_GRAVE,0,1,nil,e,tp) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
	local g=Duel.SelectTarget(tp,c11111138.filter,tp,LOCATION_GRAVE,0,1,1,nil,e,tp)
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,g,1,0,0)
end
function c11111138.operation(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	local tc=Duel.GetFirstTarget()
	if c:IsRelateToEffect(e) and tc:IsRelateToEffect(e) then
		if Duel.SpecialSummon(tc,0,tp,tp,false,false,POS_FACEUP_DEFENCE)==0 then return end
		c:SetCardTarget(tc)
	end
end
function c11111138.desop(e,tp,eg,ep,ev,re,r,rp)
	local tc=e:GetHandler():GetFirstCardTarget()
	if tc and tc:IsLocation(LOCATION_MZONE) then
		Duel.Destroy(tc,REASON_EFFECT)
	end
end
function c11111138.condition(e,tp,eg,ep,ev,re,r,rp)
	return e:GetHandler():IsPreviousLocation(LOCATION_ONFIELD)
end
function c11111138.target2(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.GetLocationCount(1-tp,LOCATION_MZONE,tp)>2
		and Duel.IsPlayerCanSpecialSummonMonster(tp,11111140,0xf,0x4011,0,1000,2,RACE_BEAST,ATTRIBUTE_LIGHT,POS_FACEUP_DEFENCE,1-tp) end
	Duel.SetOperationInfo(0,CATEGORY_TOKEN,nil,3,0,0)
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,nil,3,0,0)
end
function c11111138.activate2(e,tp,eg,ep,ev,re,r,rp)
	if Duel.GetLocationCount(1-tp,LOCATION_MZONE,tp)<3 then return end
	if not Duel.IsPlayerCanSpecialSummonMonster(tp,11111140,0xf,0x4011,0,1000,2,RACE_BEAST,ATTRIBUTE_LIGHT,POS_FACEUP_DEFENCE,1-tp) then return end
	for i=1,3 do
		local token=Duel.CreateToken(tp,11111140+i)
		if Duel.SpecialSummonStep(token,0,tp,1-tp,false,false,POS_FACEUP_DEFENCE) then
			local e2=Effect.CreateEffect(e:GetHandler())
			e2:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_CONTINUOUS)
			e2:SetCode(EVENT_DESTROY)
			e2:SetProperty(EFFECT_FLAG_CANNOT_DISABLE)
			e2:SetOperation(c11111138.damop)
			token:RegisterEffect(e2,true)
		end
	end
	Duel.SpecialSummonComplete()
end
function c11111138.damop(e,tp,eg,ep,ev,re,r,rp)
	Duel.Damage(tp,300,REASON_EFFECT)
end