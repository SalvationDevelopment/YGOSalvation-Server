--ブリューナクの影霊衣
function c80100114.initial_effect(c)
	c:EnableReviveLimit()
	--spsummon condition
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_SINGLE)
	e1:SetProperty(EFFECT_FLAG_CANNOT_DISABLE+EFFECT_FLAG_UNCOPYABLE)
	e1:SetCode(EFFECT_SPSUMMON_CONDITION)
	e1:SetValue(c80100114.splimit)
	c:RegisterEffect(e1)
	--search
	local e2=Effect.CreateEffect(c)
	e2:SetDescription(aux.Stringid(80100114,0))
	e2:SetCategory(CATEGORY_TOHAND+CATEGORY_SEARCH)
	e2:SetType(EFFECT_TYPE_IGNITION)
	e2:SetRange(LOCATION_HAND)
	e2:SetCountLimit(1,80100114)
	e2:SetCost(c80100114.cost)
	e2:SetTarget(c80100114.target)
	e2:SetOperation(c80100114.operation)
	c:RegisterEffect(e2)	
	--todeck
	local e3=Effect.CreateEffect(c)
	e3:SetDescription(aux.Stringid(80100114,1))
	e3:SetCategory(CATEGORY_TODECK)
	e3:SetType(EFFECT_TYPE_IGNITION)
	e3:SetRange(LOCATION_MZONE)
	e3:SetCountLimit(1,80101114)
	e3:SetTarget(c80100114.tdtarget)
	e3:SetOperation(c80100114.tdoperation)
	c:RegisterEffect(e3)	
	if not c80100114.global_check then
		c80100114.global_check=true
		local ge1=Effect.CreateEffect(c)
		ge1:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_CONTINUOUS)
		ge1:SetCode(EVENT_SPSUMMON_SUCCESS)
		ge1:SetOperation(c80100114.checkop)
		Duel.RegisterEffect(ge1,0)
	end
end
function c80100114.matfilter(c)
	return c:GetCode()~=80100114
end
function c80100114.checkop(e,tp,eg,ep,ev,re,r,rp)
	local tc=eg:GetFirst()
	while tc do
		if tc:IsPreviousLocation(LOCATION_EXTRA) then
			tc:RegisterFlagEffect(80100114,RESET_EVENT+0x46e0000,0,0)
		end
		tc=eg:GetNext()
	end
end
function c80100114.splimit(e,se,sp,st)
	return bit.band(st,SUMMON_TYPE_RITUAL)==SUMMON_TYPE_RITUAL
end
function c80100114.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	local c=e:GetHandler()
	if chk==0 then return c:IsDiscardable() end
	Duel.SendtoGrave(c,REASON_COST+REASON_DISCARD)
end
function c80100114.thfilter(c)
	return c:IsSetCard(0xb4) and c:IsType(TYPE_MONSTER) and c:IsAbleToHand()
end
function c80100114.target(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chk==0 then return Duel.IsExistingMatchingCard(c80100114.thfilter,tp,LOCATION_DECK,0,1,nil) end
	Duel.SetOperationInfo(0,CATEGORY_TOHAND,nil,1,tp,LOCATION_DECK)
end
function c80100114.operation(e,tp,eg,ep,ev,re,r,rp,chk)
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_ATOHAND)
	local g=Duel.SelectMatchingCard(tp,c80100114.thfilter,tp,LOCATION_DECK,0,1,1,nil)
	if g:GetCount()>0 then
		Duel.SendtoHand(g,nil,REASON_EFFECT)
		Duel.ConfirmCards(1-tp,g)
	end
end
function c80100114.filter(c)
	return c:IsFaceup() and c:GetFlagEffect(80100114)~=0 and c:IsAbleToDeck()
end
function c80100114.tdtarget(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsLocation(LOCATION_MZONE) and c80100114.filter(chkc) end
	if chk==0 then return Duel.IsExistingTarget(c80100114.filter,tp,LOCATION_MZONE,LOCATION_MZONE,1,nil) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_TODECK)
	local g=Duel.SelectTarget(tp, c80100114.filter,tp,LOCATION_MZONE,LOCATION_MZONE,1,2,nil)
	Duel.SetOperationInfo(0,CATEGORY_TODECK,g,g:GetCount(),0,0)
end
function c80100114.tgfilter(c,e)
	return c:IsFaceup() and c:IsRelateToEffect(e)
end
function c80100114.tdoperation(e,tp,eg,ep,ev,re,r,rp)
	local g=Duel.GetChainInfo(0,CHAININFO_TARGET_CARDS):Filter(c80100114.acfilter,nil,e)
	Duel.SendtoDeck(g,nil,2,REASON_EFFECT)
end