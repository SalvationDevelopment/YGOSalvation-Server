--Kuribabylon
function c123122.initial_effect(c)
c:EnableReviveLimit()
	--spsummon condition
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_SINGLE)
	e1:SetProperty(EFFECT_FLAG_CANNOT_DISABLE+EFFECT_FLAG_UNCOPYABLE)
	e1:SetCode(EFFECT_SPSUMMON_CONDITION)
	e1:SetValue(c123122.splimit)
	c:RegisterEffect(e1)
	--special summon rule
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_FIELD)
	e2:SetCode(EFFECT_SPSUMMON_PROC)
	e2:SetProperty(EFFECT_FLAG_UNCOPYABLE)
	e2:SetRange(LOCATION_EXTRA)
	e2:SetCondition(c123122.sprcon)
	e2:SetOperation(c123122.sprop)
	c:RegisterEffect(e2)
	--effect
	local e3=Effect.CreateEffect(c)
	e3:SetDescription(aux.Stringid(123122,0))
	e3:SetType(EFFECT_TYPE_IGNITION)
	e3:SetCode(EVENT_FREE_CHAIN)
	e3:SetRange(LOCATION_MZONE)
	e3:SetCondition(c123122.condition)	
	e3:SetCost(c123122.spcost)
	e3:SetTarget(c123122.sptg)
	e3:SetOperation(c123122.spop)
	c:RegisterEffect(e3)
end
c123122.material_count=5
c123122.material={123132,123133,123134,123135,40640057}
function c123122.splimit(e,se,sp,st)
	return e:GetHandler():GetLocation()~=LOCATION_EXTRA
end
function c123122.sprfilter(c,code)
	return c:IsCode(code)
end
function c123122.sprcon(e,c)
	if c==nil then return true end
	local tp=c:GetControler()
	return Duel.IsExistingMatchingCard(c123122.sprfilter,tp,LOCATION_ONFIELD,0,1,nil,123132)
		and Duel.IsExistingMatchingCard(c123122.sprfilter,tp,LOCATION_ONFIELD,0,1,nil,123133)
		and Duel.IsExistingMatchingCard(c123122.sprfilter,tp,LOCATION_ONFIELD,0,1,nil,123134)
		and Duel.IsExistingMatchingCard(c123122.sprfilter,tp,LOCATION_ONFIELD,0,1,nil,123135)
		and Duel.IsExistingMatchingCard(c123122.sprfilter,tp,LOCATION_ONFIELD,0,1,nil,40640057)		
end
function c123122.sprop(e,tp,eg,ep,ev,re,r,rp,c)
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_TOGRAVE)
	local g1=Duel.SelectMatchingCard(tp,c123122.sprfilter,tp,LOCATION_ONFIELD,0,1,1,nil,123132)
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_TOGRAVE)
	local g2=Duel.SelectMatchingCard(tp,c123122.sprfilter,tp,LOCATION_ONFIELD,0,1,1,nil,123133)
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_TOGRAVE)
	local g3=Duel.SelectMatchingCard(tp,c123122.sprfilter,tp,LOCATION_ONFIELD,0,1,1,nil,123134)
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_TOGRAVE)
	local g4=Duel.SelectMatchingCard(tp,c123122.sprfilter,tp,LOCATION_ONFIELD,0,1,1,nil,123135)
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_TOGRAVE)
	local g5=Duel.SelectMatchingCard(tp,c123122.sprfilter,tp,LOCATION_ONFIELD,0,1,1,nil,40640057)	
	g1:Merge(g2)
	g1:Merge(g3)
	g1:Merge(g4)
	g1:Merge(g5)
	local tc=g1:GetFirst()
	while tc do
		if not tc:IsFaceup() then Duel.ConfirmCards(1-tp,tc) end
		tc=g1:GetNext()
	end
	Duel.Release(g1,nil,5,REASON_COST)	
end

function c123122.condition(e,tp,eg,ep,ev,re,r,rp)
	return Duel.GetCurrentPhase()==PHASE_MAIN1
end

function c123122.spcost(e,tp,eg,ep,ev,re,r,rp,chk)
	local c=e:GetHandler()
	if chk==0 then return c:IsAbleToExtraAsCost() end
	Duel.SendtoDeck(c,nil,0,REASON_COST)
end
function c123122.sptg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return true end
	Duel.SetOperationInfo(0,CATEGORY_TOKEN,nil,4,0,0)
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,nil,4,0,0)
end
function c123122.spop(e,tp,eg,ep,ev,re,r,rp)
	if Duel.GetLocationCount(tp,LOCATION_MZONE)==0 then return end
	if Duel.IsPlayerCanSpecialSummonMonster(tp,123132,0,0x4011,300,200,1,RACE_FIEND,ATTRIBUTE_DARK) then
		local token=Duel.CreateToken(tp,123132)
		Duel.SpecialSummonStep(token,0,tp,tp,false,false,POS_FACEUP)
		local e1=Effect.CreateEffect(e:GetHandler())
		e1:SetDescription(aux.Stringid(123122,0))
		e1:SetType(EFFECT_TYPE_QUICK_O)
		e1:SetCode(EVENT_BE_BATTLE_TARGET)
		e1:SetRange(LOCATION_MZONE)
		e1:SetCondition(c123122.ncondition)
		e1:SetOperation(c123122.noperation)
		e1:SetCountLimit(1)
		token:RegisterEffect(e1)
		local e01=Effect.CreateEffect(e:GetHandler())
		e01:SetType(EFFECT_TYPE_SINGLE)
		e01:SetCode(EFFECT_UNRELEASEABLE_SUM)
		e01:SetProperty(EFFECT_FLAG_CANNOT_DISABLE)
		e01:SetValue(1)
		token:RegisterEffect(e01,true)		
	end
	if Duel.GetLocationCount(tp,LOCATION_MZONE)>0
		and Duel.IsPlayerCanSpecialSummonMonster(tp,123133,0,0x4011,300,200,1,RACE_FIEND,ATTRIBUTE_DARK) then
		local token=Duel.CreateToken(tp,123133)
		Duel.SpecialSummonStep(token,0,tp,tp,false,false,POS_FACEUP)
		local e2=Effect.CreateEffect(e:GetHandler())
		e2:SetType(EFFECT_TYPE_SINGLE)
		e2:SetCode(EFFECT_UNRELEASEABLE_SUM)
		e2:SetProperty(EFFECT_FLAG_CANNOT_DISABLE)
		e2:SetValue(1)
		token:RegisterEffect(e2,true)		
	end
	if Duel.GetLocationCount(tp,LOCATION_MZONE)>0
		and Duel.IsPlayerCanSpecialSummonMonster(tp,123135,0,0x4011,300,200,1,RACE_FIEND,ATTRIBUTE_DARK) then
		local token=Duel.CreateToken(tp,123135)
		Duel.SpecialSummonStep(token,0,tp,tp,false,false,POS_FACEUP)
		local e4=Effect.CreateEffect(e:GetHandler())
		e4:SetDescription(aux.Stringid(123122,0))
		e4:SetCategory(CATEGORY_ATKCHANGE)
		e4:SetProperty(EFFECT_FLAG_CARD_TARGET)
		e4:SetType(EFFECT_TYPE_IGNITION)
		e4:SetRange(LOCATION_MZONE)
		e4:SetCountLimit(1)
		e4:SetTarget(c123122.target)
		e4:SetOperation(c123122.operation)
		token:RegisterEffect(e4)
		local e04=Effect.CreateEffect(e:GetHandler())
		e04:SetType(EFFECT_TYPE_SINGLE)
		e04:SetCode(EFFECT_UNRELEASEABLE_SUM)
		e04:SetProperty(EFFECT_FLAG_CANNOT_DISABLE)
		e04:SetValue(1)
		token:RegisterEffect(e04,true)	
	end	
	if Duel.GetLocationCount(tp,LOCATION_MZONE)>0
		and Duel.IsPlayerCanSpecialSummonMonster(tp,123134,0,0x4011,300,200,1,RACE_FIEND,ATTRIBUTE_DARK) then
		local token=Duel.CreateToken(tp,123134)
		Duel.SpecialSummonStep(token,0,tp,tp,false,false,POS_FACEUP)
		local e3=Effect.CreateEffect(e:GetHandler())
		e3:SetDescription(aux.Stringid(123122,0))
		e3:SetCategory(CATEGORY_SPECIAL_SUMMON)
		e3:SetType(EFFECT_TYPE_CONTINUOUS+EFFECT_TYPE_SINGLE)
		e3:SetCode(EVENT_SPSUMMON_SUCCESS)
		e3:SetTarget(c123122.sptg2)
		e3:SetOperation(c123122.spop2)
		token:RegisterEffect(e3)
		local e03=Effect.CreateEffect(e:GetHandler())
		e03:SetType(EFFECT_TYPE_SINGLE)
		e03:SetCode(EFFECT_UNRELEASEABLE_SUM)
		e03:SetProperty(EFFECT_FLAG_CANNOT_DISABLE)
		e03:SetValue(1)
		token:RegisterEffect(e03,true)
	end

	Duel.SpecialSummonComplete()
end

function c123122.target(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsControler(1-tp) and chkc:IsFaceup() and chkc:IsLocation(LOCATION_MZONE) end
	if chk==0 then return Duel.IsExistingTarget(Card.IsFaceup,tp,0,LOCATION_MZONE,1,nil) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_FACEUP)
	Duel.SelectTarget(tp,Card.IsFaceup,tp,0,LOCATION_MZONE,1,1,nil)
end

function c123122.operation(e,tp,eg,ep,ev,re,r,rp)
	local tc=Duel.GetFirstTarget()
	if tc:IsFaceup() and tc:IsRelateToEffect(e) then
		local e1=Effect.CreateEffect(e:GetHandler())
		e1:SetType(EFFECT_TYPE_SINGLE)
		e1:SetCode(EFFECT_SET_ATTACK_FINAL)
		e1:SetReset(RESET_EVENT+0x1fe0000+RESET_PHASE+PHASE_END)
		e1:SetValue(tc:GetAttack()/2)
		tc:RegisterEffect(e1)
	end
end

function c123122.ncondition(e,tp,eg,ep,ev,re,r,rp)
	if Duel.GetTurnPlayer()==tp and Duel.GetCurrentPhase()==PHASE_BATTLE then return end
	local ec=eg:GetFirst()
	return ec:IsFaceup() and ec:IsCode(123132) or ec:IsCode(123133) or ec:IsCode(123134) or ec:IsCode(123135) or ec:IsCode(40640057)
end

function c123122.noperation(e,tp,eg,ep,ev,re,r,rp)
	Duel.NegateAttack()
end

function c123122.spfilter(c,e,tp)
	return c:IsCode(40640057) and c:IsCanBeSpecialSummoned(e,0,tp,false,false)
end

function c123122.sptg2(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsExistingMatchingCard(c123122.spfilter,tp,LOCATION_HAND+LOCATION_DECK+LOCATION_GRAVE,0,1,nil,e,tp) end
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,nil,1,tp,LOCATION_HAND+LOCATION_DECK+LOCATION_GRAVE)
end
function c123122.spop2(e,tp,eg,ep,ev,re,r,rp)
	if Duel.GetLocationCount(tp,LOCATION_MZONE)==0 then return end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
	local g=Duel.SelectMatchingCard(tp,c123122.spfilter,tp,LOCATION_HAND+LOCATION_DECK+LOCATION_GRAVE,0,1,1,nil,e,tp)
	local tc=g:GetFirst()
	if tc then
		Duel.SpecialSummon(tc,0,tp,tp,true,true,POS_FACEUP)
		tc:CompleteProcedure()
	end
end