--ヴァンパイア・グレイス
function c80600031.initial_effect(c)
	--spsummon
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e1:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_TRIGGER_O)
	e1:SetRange(LOCATION_GRAVE)
	e1:SetCode(EVENT_SPSUMMON_SUCCESS)
	e1:SetCondition(c80600031.spcon)
	e1:SetCost(c80600031.spcost)
	e1:SetTarget(c80600031.sptg)
	e1:SetOperation(c80600031.spop)
	c:RegisterEffect(e1)
	local e2=Effect.CreateEffect(c)
	e2:SetCategory(CATEGORY_TOGRAVE)
	e2:SetType(EFFECT_TYPE_IGNITION)
	e2:SetRange(LOCATION_MZONE)
	e2:SetCountLimit(1)
	e2:SetCost(c80600031.tgtg)
	e2:SetOperation(c80600031.tgop)
	c:RegisterEffect(e2)
end
function c80600031.cfilter(c,tp)
	return c:IsFaceup() and c:IsControler(tp) and c:IsRace(RACE_ZOMBIE) and c:GetLevel()>4 
end
function c80600031.spcon(e,tp,eg,ep,ev,re,r,rp)
	local rc=re:GetHandler()
	local ex=Duel.GetOperationInfo(re,CATEGORY_SPECIAL_SUMMON)
	return eg:IsExists(c80600031.cfilter,1,nil,tp) and rc:IsRace(RACE_ZOMBIE) and ex
end
function c80600031.spcost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.GetFlagEffect(tp,80600031)==0  and Duel.CheckLPCost(tp,2000) end
	Duel.PayLPCost(tp,2000)
	Duel.RegisterFlagEffect(tp,80600031,RESET_PHASE+PHASE_END,0,1)
end
function c80600031.sptg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.GetLocationCount(tp,LOCATION_MZONE)>0
		and e:GetHandler():IsCanBeSpecialSummoned(e,0,tp,false,false) end
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,e:GetHandler(),1,0,0)
end
function c80600031.spop(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	if c:IsRelateToEffect(e) then
		Duel.SpecialSummon(c,0,tp,tp,false,false,POS_FACEUP)
	end
end

function c80600031.tgtg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return true end
	Duel.Hint(HINT_SELECTMSG,tp,aux.Stringid(80600031,3))
	local op=Duel.SelectOption(tp,aux.Stringid(80600031,0),aux.Stringid(80600031,1),aux.Stringid(80600031,2))
	e:SetLabel(op)
	Duel.SetOperationInfo(0,CATEGORY_TOGRAVE,nil,1,1-tp,LOCATION_DECK)
end
function c80600031.tgfilter(c,ty)
	return c:IsType(ty) and c:IsAbleToGrave()
end
function c80600031.tgop(e,tp,eg,ep,ev,re,r,rp)
	local g=nil
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_TOGRAVE)
	if e:GetLabel()==0 then g=Duel.SelectMatchingCard(1-tp,c80600031.tgfilter,1-tp,LOCATION_DECK,0,1,1,nil,TYPE_MONSTER)
	elseif e:GetLabel()==1 then g=Duel.SelectMatchingCard(1-tp,c80600031.tgfilter,1-tp,LOCATION_DECK,0,1,1,nil,TYPE_SPELL)
	else g=Duel.SelectMatchingCard(1-tp,c80600031.tgfilter,1-tp,LOCATION_DECK,0,1,1,nil,TYPE_TRAP) end
	Duel.SendtoGrave(g,REASON_EFFECT)
end
