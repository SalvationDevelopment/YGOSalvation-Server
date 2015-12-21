--武神帝－ツクヨミ
function c80800054.initial_effect(c)
	c:SetUniqueOnField(1,0,80800054)
	--xyz summon
	aux.AddXyzProcedure(c,aux.XyzFilterFunctionF(c,aux.FilterBoolFunction(Card.IsAttribute,ATTRIBUTE_LIGHT),4),2)
	c:EnableReviveLimit()
	--draw
	local e1=Effect.CreateEffect(c)
	e1:SetDescription(aux.Stringid(80800054,0))
	e1:SetCategory(CATEGORY_DRAW)
	e1:SetType(EFFECT_TYPE_IGNITION)
	e1:SetCountLimit(1)
	e1:SetRange(LOCATION_MZONE)
	e1:SetCost(c80800054.cost)
	e1:SetTarget(c80800054.target)
	e1:SetOperation(c80800054.operation)
	c:RegisterEffect(e1)
	--leave field
	local e2=Effect.CreateEffect(c)
	e2:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e2:SetDescription(aux.Stringid(80800054,1))
	e2:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_O)
	e2:SetProperty(EFFECT_FLAG_CARD_TARGET+EFFECT_FLAG_DAMAGE_STEP)
	e2:SetCode(EVENT_LEAVE_FIELD)
	e2:SetCost(c80800054.spcost)
	e2:SetCondition(c80800054.spcon)
	e2:SetTarget(c80800054.sptg)
	e2:SetOperation(c80800054.spop)
	c:RegisterEffect(e2)
end
function c80800054.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return e:GetHandler():CheckRemoveOverlayCard(tp,1,REASON_COST) end
	e:GetHandler():RemoveOverlayCard(tp,1,1,REASON_COST)
end
function c80800054.target(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.GetFieldGroupCount(tp,LOCATION_HAND,0)>0
		and Duel.IsPlayerCanDraw(tp,2) 
	end
	Duel.SetOperationInfo(0,CATEGORY_DRAW,nil,0,tp,2)
end
function c80800054.operation(e,tp,eg,ep,ev,re,r,rp)
	local h1=Duel.GetFieldGroupCount(tp,LOCATION_HAND,0)
	if h1<1 then return end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_TOGRAVE)
	local g=Duel.GetFieldGroup(tp,LOCATION_HAND,0)
	Duel.SendtoGrave(g,REASON_EFFECT)
	Duel.BreakEffect()
	Duel.Draw(tp,2,REASON_EFFECT)
end
function c80800054.spcon(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	local count=e:GetHandler():GetOverlayCount()
	e:SetLabel(count)
	return c:IsPreviousPosition(POS_FACEUP) and not c:IsLocation(LOCATION_DECK)
		and c:GetPreviousControler()==tp and rp~=tp and count>0
end
function c80800054.spcost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.GetFlagEffect(tp,80800054)==0 end
	Duel.RegisterFlagEffect(tp,80800054,RESET_PHASE+PHASE_END,0,1)
end
function c80800054.filter(c,e,tp)
	return c:IsRace(RACE_BEASTWARRIOR) and c:IsSetCard(0x88) and c:GetLevel()==4 and c:IsCanBeSpecialSummoned(e,0,tp,false,false)
end
function c80800054.sptg(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsLocation(LOCATION_GRAVE) and chkc:IsControler(tp) and c80800054.filter(chkc) end
	local count=e:GetLabel()
	if chk==0 then return Duel.IsExistingTarget(c80800054.filter,tp,LOCATION_GRAVE,0,1,nil,e,tp) 
		and count>0
	end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
	local g=Duel.SelectTarget(tp,c80800054.filter,tp,LOCATION_GRAVE,0,1,count,nil,e,tp)
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,g,g:GetCount(),0,0)
end
function c80800054.spop(e,tp,eg,ep,ev,re,r,rp)
	local g=Duel.GetChainInfo(0,CHAININFO_TARGET_CARDS):Filter(Card.IsRelateToEffect,nil,e)
	if not g or Duel.GetLocationCount(tp,LOCATION_MZONE)<g:GetCount() then return end
	Duel.SpecialSummon(g,0,tp,tp,false,false,POS_FACEUP)
end

