--Erebus the Netherworld Monarch
function c13710101.initial_effect(c)
	--summon with 1 tribute
	local e1=Effect.CreateEffect(c)
	e1:SetDescription(aux.Stringid(87288189,0))
	e1:SetProperty(EFFECT_FLAG_CANNOT_DISABLE+EFFECT_FLAG_UNCOPYABLE)
	e1:SetType(EFFECT_TYPE_SINGLE)
	e1:SetCode(EFFECT_SUMMON_PROC)
	e1:SetCondition(c13710101.otcon)
	e1:SetOperation(c13710101.otop)
	e1:SetValue(SUMMON_TYPE_ADVANCE)
	c:RegisterEffect(e1)
	local e2=e1:Clone()
	e2:SetCode(EFFECT_SET_PROC)
	c:RegisterEffect(e2)
	--destroy
	local e3=Effect.CreateEffect(c)
	e3:SetDescription(aux.Stringid(87288189,1))
	e3:SetCategory(CATEGORY_REMOVE+CATEGORY_DAMAGE)
	e3:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_O)
	e3:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e3:SetCode(EVENT_SUMMON_SUCCESS)
	e3:SetCondition(c13710101.condition)
	e3:SetTarget(c13710101.target)
	e3:SetOperation(c13710101.operation)
	c:RegisterEffect(e3)
	local e4=Effect.CreateEffect(c)
	e4:SetDescription(aux.Stringid(66337215,0))
	e4:SetCategory(CATEGORY_TOHAND)
	e4:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e4:SetType(EFFECT_TYPE_QUICK_O)
	e4:SetCode(EVENT_FREE_CHAIN)
	e4:SetCountLimit(1)
	e4:SetRange(LOCATION_GRAVE)
	e4:SetCost(c13710101.thcost)
	e4:SetTarget(c13710101.thtg)
	e4:SetOperation(c13710101.thop)
	c:RegisterEffect(e4)
end
function c13710101.otfilter(c)
	return bit.band(c:GetSummonType(),SUMMON_TYPE_ADVANCE)==SUMMON_TYPE_ADVANCE
end
function c13710101.otcon(e,c)
	if c==nil then return true end
	local mg=Duel.GetMatchingGroup(c13710101.otfilter,0,LOCATION_MZONE,LOCATION_MZONE,nil)
	return c:GetLevel()>6 and Duel.GetLocationCount(c:GetControler(),LOCATION_MZONE)>-1
		and Duel.GetTributeCount(c,mg)>0
end
function c13710101.otop(e,tp,eg,ep,ev,re,r,rp,c)
	local mg=Duel.GetMatchingGroup(c13710101.otfilter,0,LOCATION_MZONE,LOCATION_MZONE,nil)
	local sg=Duel.SelectTribute(tp,c,1,1,mg)
	c:SetMaterial(sg)
	Duel.Release(sg,REASON_SUMMON+REASON_MATERIAL)
end

function c13710101.condition(e,tp,eg,ep,ev,re,r,rp)
	return e:GetHandler():GetSummonType()==SUMMON_TYPE_ADVANCE
end

function c13710101.filter(c,tp)
	return c:IsSetCard(0xbe) and c:IsType(TYPE_SPELL+TYPE_TRAP) and c:IsAbleToGrave()
end
function c13710101.filter1(c,tp)
	return c:IsSetCard(0xbe) and c:IsType(TYPE_SPELL+TYPE_TRAP) and c:IsAbleToGrave()
	and Duel.IsExistingTarget(c13710101.filter3,tp,0,LOCATION_DECK+LOCATION_HAND,1,nil,code)
end
function c13710101.filter2(c,code)
	return c:IsSetCard(0xbe) and c:IsType(TYPE_SPELL+TYPE_TRAP) and c:GetCode()==code and c:IsAbleToGrave()
end
function c13710101.target(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	local c=e:GetHandler()
	local g=Duel.GetMatchingGroup(c13710101.filter,c:GetControler(),LOCATION_DECK+LOCATION_HAND,0,nil)
	local ct=g:GetClassCount(Card.GetCode)
	if chk==0 then return Duel.IsExistingMatchingCard(Card.IsAbleToDeck,tp,0,LOCATION_ONFIELD+LOCATION_HAND+LOCATION_GRAVE+LOCATION_DECK,1,nil) and
	  ct>1 end
	local off=1
	local ops={}
	local opval={}
	if Duel.IsExistingMatchingCard(Card.IsAbleToDeck,tp,0,LOCATION_ONFIELD,1,nil) then
		ops[off]=aux.Stringid(13710101,1)
		opval[off-1]=1
		off=off+1
	end
	if Duel.IsExistingMatchingCard(Card.IsAbleToDeck,tp,0,LOCATION_HAND,1,nil) then
		ops[off]=aux.Stringid(13710101,2)
		opval[off-1]=2
		off=off+1
	end
	if Duel.IsExistingMatchingCard(Card.IsAbleToDeck,tp,0,LOCATION_GRAVE,1,nil) then
		ops[off]=aux.Stringid(13710101,3)
		opval[off-1]=3
		off=off+1
	end
	if off==1 then return end
	local op=Duel.SelectOption(tp,table.unpack(ops))
	e:SetLabel(opval[op])
end
function c13710101.operation(e,tp,eg,ep,ev,re,r,rp)
	local g=Duel.GetMatchingGroup(c13710101.filter,tp,LOCATION_DECK,0,nil)
	if g:GetCount()>1 then
		Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_TOGRAVE)
		local sg=g:Select(tp,1,1,nil)
		local code=sg:GetFirst():GetCode()
		g:Remove(c13710101.filter2,nil,code)
		local sg2=g:Select(tp,1,1,nil)
		Duel.SendtoGrave(sg,REASON_EFFECT)
		Duel.SendtoGrave(sg2,REASON_EFFECT)
	local op=e:GetLabel()
	if op==1 then
		Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_REMOVE)
		local g=Duel.SelectMatchingCard(tp,Card.IsAbleToDeck,tp,0,LOCATION_ONFIELD,1,1,nil)
		if g:GetCount()>0 then
			Duel.HintSelection(g)
			Duel.SendtoDeck(g,nil,2,REASON_EFFECT)
		end
	elseif op==2 then
		local g=Duel.GetMatchingGroup(Card.IsAbleToDeck,tp,0,LOCATION_HAND,nil)
		if g:GetCount()>0 then
			local sg=g:RandomSelect(tp,1)
			Duel.SendtoDeck(sg,nil,2,REASON_EFFECT)
		end
	elseif op==3 then
		Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_REMOVE)
		local g=Duel.SelectMatchingCard(tp,Card.IsAbleToDeck,tp,0,LOCATION_GRAVE,1,1,nil)
		if g:GetCount()>0 then
			Duel.SendtoDeck(g,nil,2,REASON_EFFECT)
		end
	end
	end
end


function c13710101.thcost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsExistingMatchingCard(c13710101.filter,tp,LOCATION_HAND,0,1,e:GetHandler()) end
	Duel.DiscardHand(tp,c13710101.filter,1,1,REASON_COST+REASON_DISCARD)
end
function c13710101.rmonfilter(c)
	return c:GetAttack()>=2400 and c:GetDefence()==1000 and c:IsAbleToHand()
end
function c13710101.thtg(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:GetLocation()==LOCATION_GRAVE and chkc:GetControler()==tp and c13710101.filter(chkc) end
	if chk==0 then return Duel.IsExistingTarget(c13710101.rmonfilter,tp,LOCATION_GRAVE,0,1,nil) and
	(Duel.GetCurrentPhase()==PHASE_MAIN2 or Duel.GetCurrentPhase()==PHASE_MAIN1) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_ATOHAND)
	local g=Duel.SelectTarget(tp,c13710101.rmonfilter,tp,LOCATION_GRAVE,0,1,1,nil)
	Duel.SetOperationInfo(0,CATEGORY_TOHAND,g,1,0,0)
end
function c13710101.thop(e,tp,eg,ep,ev,re,r,rp)
	local tc=Duel.GetFirstTarget()
	if tc:IsRelateToEffect(e) then
		Duel.SendtoHand(tc,nil,REASON_EFFECT)
		Duel.ConfirmCards(1-tp,tc)
	end
end
